#!/usr/bin/env bash
# Production deploy for the HCG Droplet. GitHub Actions runs this on every push
# to main (.github/workflows/deploy.yml); it can also be run by hand as root:
#
#   bash /opt/hcg/deploy.sh
#   REBUILD_ALL=true bash /opt/hcg/deploy.sh
#
# Options (environment variables):
#   DEPLOY_BRANCH=main      branch to deploy
#   REBUILD_ALL=true        rebuild every service, not only the ones whose folder changed
#   REINDEX_CHATBOT=true    force a full chatbot re-embed even if the website text is unchanged
#   GIT_FETCH_URL=<url>     fetch from this URL instead of `origin` (CI passes a short-lived token)
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/hcg}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
REBUILD_ALL="${REBUILD_ALL:-false}"
REINDEX_CHATBOT="${REINDEX_CHATBOT:-false}"
GIT_FETCH_URL="${GIT_FETCH_URL:-origin}"

compose() { docker compose --env-file .env.prod -f docker-compose.prod.yml "$@"; }
log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }

# wait_for <label> <timeout-seconds> <command...>
wait_for() {
  local label="$1" timeout="$2" waited=0
  shift 2
  until "$@" >/dev/null 2>&1; do
    if ((waited >= timeout)); then
      warn "$label was not ready after ${timeout}s"
      return 1
    fi
    sleep 5
    waited=$((waited + 5))
  done
  echo "$label is up (${waited}s)"
}

on_error() {
  warn "Deploy failed at line $1. Containers still run the last successful build unless they were already restarted."
  compose ps || true
  compose logs --tail 40 backend frontend ai-service || true
}

main() {
  trap 'on_error $LINENO' ERR
  cd "$APP_DIR"
  [[ -f .env.prod ]] || { echo ".env.prod not found in $APP_DIR"; exit 1; }

  # A manual run and a CI run must never build at the same time on a 2 GB box.
  exec 9>/tmp/hcg-deploy.lock
  flock -w 1800 9

  log "Updating code to origin/$DEPLOY_BRANCH"
  local prev head changed
  prev="$(git rev-parse HEAD)"
  GIT_TERMINAL_PROMPT=0 git fetch --quiet "$GIT_FETCH_URL" \
    "+refs/heads/$DEPLOY_BRANCH:refs/remotes/origin/$DEPLOY_BRANCH"
  # .env.prod and certbot/ are untracked, so a forced checkout never touches them.
  git checkout --quiet --force -B "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
  head="$(git rev-parse HEAD)"
  git log -1 --format='%h %s (%an)'

  changed=""
  [[ "$prev" != "$head" ]] && changed="$(git diff --name-only "$prev" "$head")"
  has_change() { grep -qE "$1" <<<"$changed"; }

  local services=()
  if [[ "$REBUILD_ALL" == "true" ]]; then
    services=(ai-service backend frontend)
  else
    if has_change '^ai-service/'; then services+=(ai-service); fi
    if has_change '^backend/'; then services+=(backend); fi
    if has_change '^frontend/'; then services+=(frontend); fi
  fi

  # Build before touching running containers: a failed build leaves the live site as it was.
  # One service at a time, because parallel builds run out of memory on this Droplet.
  if ((${#services[@]} == 0)); then
    log "No service code changed; skipping image builds"
  fi
  for service in "${services[@]}"; do
    log "Building $service"
    compose build "$service"
  done

  log "Starting containers"
  compose up -d --remove-orphans
  # nginx bind-mounts a single file; a git checkout replaces it, so the container must be recreated to see it.
  if has_change '^nginx/'; then
    compose up -d --force-recreate nginx
  fi

  log "Waiting for services"
  wait_for "Backend API" 240 curl -fsS http://localhost/api/health
  wait_for "Website" 180 curl -fsS -o /dev/null http://localhost/
  wait_for "AI service" 120 compose exec -T ai-service \
    python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health', timeout=5)"

  log "Database migrations"
  compose exec -T backend pnpm run migration:run:prod

  log "Admin seed (skipped if the admin already exists)"
  compose exec -T backend pnpm run seed:prod | sed '/password:/d'

  log "Chatbot knowledge sync (website pages + built-in knowledge)"
  local force_sync=False
  [[ "$REINDEX_CHATBOT" == "true" ]] && force_sync=True
  # A renamed or removed page shows up here: the chatbot would link to a 404 and keep the page's old text.
  if ! compose exec -T ai-service python -c "
from app.services.sync_service import full_sync
r = full_sync(force=$force_sync)
print(r)
for key, what in (('broken_links', 'Chatbot links to pages the website no longer serves'),
                  ('site_pages_failed', 'Chatbot could not read these pages and kept their old text')):
    if r.get(key):
        print('!!  %s: %s (update ai-service/app/rag/constants.py and site_pages.py)' % (what, ', '.join(r[key])))
" 2>&1 \
    | grep -v 'Multiple definitions in dictionary'; then
    warn "Chatbot sync failed. The site is live; re-run with REINDEX_CHATBOT=true."
  fi

  # Never prune volumes: the database lives in the pgdata volume.
  log "Cleaning up stopped containers, unused images/networks and old build cache"
  docker container prune -f
  docker image prune -f
  docker network prune -f
  # Keep only the most recent build cache (enough for fast rebuilds); every deploy adds hundreds of MB.
  docker builder prune -f --reserved-space 4gb
  docker system df
  df -h /

  log "Deployed $(git log -1 --format='%h %s')"
  compose ps
}

# Keep bash from reading the rest of this file after `git checkout` rewrites it mid-run.
main "$@"; exit
