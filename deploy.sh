#!/usr/bin/env bash
# Production deploy for the HCG Droplet. GitHub Actions runs this on every push
# to main (.github/workflows/deploy.yml); it can also be run by hand as root:
#
#   bash /opt/hcg/deploy.sh
#   REBUILD_ALL=true bash /opt/hcg/deploy.sh
#
# Options (environment variables):
#   DEPLOY_BRANCH=main        branch to deploy
#   BUILD_BACKEND=true/false  passed from CI if backend needs rebuilding
#   BUILD_FRONTEND=true/false passed from CI if frontend needs rebuilding
#   BUILD_AI_SERVICE=true/false passed from CI if ai-service needs rebuilding
#   BUILD_NGINX=true/false    passed from CI if nginx config needs reloading
#   REBUILD_ALL=true          rebuild every service, not only the ones whose folder changed
#   REINDEX_CHATBOT=true      force a full chatbot re-embed even if the website text is unchanged
#   GIT_FETCH_URL=<url>       fetch from this URL instead of `origin` (CI passes a short-lived token)
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/hcg}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
REBUILD_ALL="${REBUILD_ALL:-false}"
REINDEX_CHATBOT="${REINDEX_CHATBOT:-false}"
BUILD_BACKEND="${BUILD_BACKEND:-}"
BUILD_FRONTEND="${BUILD_FRONTEND:-}"
BUILD_AI_SERVICE="${BUILD_AI_SERVICE:-}"
BUILD_NGINX="${BUILD_NGINX:-}"
GIT_FETCH_URL="${GIT_FETCH_URL:-origin}"

# Enable Docker BuildKit for cached layer re-use
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

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
    sleep 3
    waited=$((waited + 3))
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

  local rebuild_ai=false
  local rebuild_backend=false
  local rebuild_frontend=false
  local reload_nginx=false

  if [[ "$REBUILD_ALL" == "true" ]]; then
    rebuild_ai=true
    rebuild_backend=true
    rebuild_frontend=true
  elif [[ -n "$BUILD_BACKEND" || -n "$BUILD_FRONTEND" || -n "$BUILD_AI_SERVICE" || -n "$BUILD_NGINX" ]]; then
    # CI explicitly provided the exact services that changed for this deployment
    [[ "$BUILD_AI_SERVICE" == "true" ]] && rebuild_ai=true
    [[ "$BUILD_BACKEND" == "true" ]] && rebuild_backend=true
    [[ "$BUILD_FRONTEND" == "true" ]] && rebuild_frontend=true
    [[ "$BUILD_NGINX" == "true" ]] && reload_nginx=true
  else
    # Fallback when deploy.sh is executed manually in droplet terminal without CI env vars
    if has_change '^ai-service/'; then rebuild_ai=true; fi
    if has_change '^backend/'; then rebuild_backend=true; fi
    if has_change '^frontend/'; then rebuild_frontend=true; fi
    if has_change '^nginx/'; then reload_nginx=true; fi
  fi

  if has_change '^nginx/'; then reload_nginx=true; fi

  local services=()
  if [[ "$rebuild_ai" == "true" ]]; then services+=(ai-service); fi
  if [[ "$rebuild_backend" == "true" ]]; then services+=(backend); fi
  if [[ "$rebuild_frontend" == "true" ]]; then services+=(frontend); fi

  log "Services to build: ${services[*]:-none}"

  # Build before touching running containers: a failed build leaves the live site as it was.
  # One service at a time, because parallel builds run out of memory on this Droplet.
  if ((${#services[@]} == 0)); then
    log "No service code changed; skipping image builds"
  else
    for service in "${services[@]}"; do
      log "Building $service"
      compose build "$service"
    done
  fi

  log "Starting containers"
  compose up -d --remove-orphans

  # Nginx reload / recreation
  if [[ "$reload_nginx" == "true" ]]; then
    log "Recreating nginx with updated configuration"
    compose up -d --force-recreate nginx
  else
    # Reload nginx gracefully so it refreshes internal upstream DNS immediately
    compose exec -T nginx nginx -s reload 2>/dev/null || true
  fi

  log "Waiting for services"
  if [[ "$rebuild_backend" == "true" ]]; then
    wait_for "Backend API" 240 curl -fsS http://localhost/api/health
  fi
  if [[ "$rebuild_frontend" == "true" ]]; then
    wait_for "Website" 180 curl -fsS -o /dev/null http://localhost/
  fi
  if [[ "$rebuild_ai" == "true" ]]; then
    wait_for "AI service" 120 compose exec -T ai-service \
      python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health', timeout=5)"
  fi
  # Fast sanity ping for the live website
  wait_for "Website root" 30 curl -fsS -o /dev/null http://localhost/

  # Database migrations and seed: ONLY run if backend was rebuilt
  if [[ "$rebuild_backend" == "true" ]]; then
    log "Database migrations"
    compose exec -T backend pnpm run migration:run:prod

    log "Admin seed (skipped if the admin already exists)"
    compose exec -T backend pnpm run seed:prod | sed '/password:/d'
  else
    log "Skipping database migrations & admin seed (backend code unchanged)"
  fi

  # Chatbot knowledge sync: ONLY run if AI service changed or explicitly requested
  if [[ "$REINDEX_CHATBOT" == "true" || "$rebuild_ai" == "true" ]]; then
    log "Chatbot knowledge sync (website pages + built-in knowledge)"
    local force_sync=False
    [[ "$REINDEX_CHATBOT" == "true" ]] && force_sync=True
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
  else
    log "Skipping chatbot knowledge sync (AI service unchanged; set REINDEX_CHATBOT=true to re-sync)"
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
