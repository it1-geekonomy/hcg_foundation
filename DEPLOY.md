# Deploying HCG Foundation to a DigitalOcean Droplet

Everything runs on one Droplet with Docker Compose, defined in
`docker-compose.prod.yml`, with settings in `.env.prod` (copied from
`.env.example`). Every compose command passes both files:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml <command>
```

| Service    | What it is                          | Reachable from        |
|------------|-------------------------------------|-----------------------|
| nginx      | Reverse proxy on port 80/443        | Internet              |
| frontend   | Next.js website + CMS               | nginx only            |
| backend    | NestJS API (`/api`, docs at `/api/docs`) | nginx only       |
| ai-service | Python chatbot (FastAPI)            | backend only          |
| postgres   | Postgres 16 + pgvector              | containers only       |

Nginx sends `/api/website-images` and `/api/download` to Next.js, every other
`/api/*` path to NestJS, and everything else to Next.js.

## 1. Create the Droplet

1. DigitalOcean → Create → Droplets.
2. Region: **Bangalore (BLR1)**. Image: **Ubuntu 24.04 LTS**.
3. Size: **Basic, 4 GB RAM / 2 vCPU** (about $24/month). 2 GB works but builds are slow.
4. Authentication: **SSH key** (add your public key).
5. Optional: enable weekly backups.

Note the Droplet's public IP; it's used below as `YOUR_IP`.

## 2. Prepare the server

From your machine (PowerShell works):

```bash
ssh root@YOUR_IP
```

On the server:

```bash
git clone https://github.com/it2-geekonomy/hcg_foundation.git /opt/hcg
cd /opt/hcg
git checkout main
bash setup-droplet.sh
```

The repo is private, so `git clone` asks for credentials. Use your GitHub
username and a **Personal Access Token** (GitHub → Settings → Developer
settings → Fine-grained tokens, read-only access to this repo) as the password.

## 3. Configure environment

```bash
cd /opt/hcg
cp .env.example .env.prod
nano .env.prod
```

- Set `PUBLIC_URL=http://YOUR_IP`.
- Generate each secret with `openssl rand -hex 32` (`DB_PASSWORD`,
  `AUTH_JWT_SECRET`, `AI_SERVICE_INTERNAL_KEY`).
- Copy R2, Razorpay, Resend and OpenAI keys from your local `backend/.env`
  and `ai-service/.env`.

`.env.prod` is gitignored, so it stays only on the server.

## 4. Start everything

```bash
cd /opt/hcg
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f backend   # Ctrl+C to stop
```

The first build takes 5–10 minutes. On start, the backend applies TypeORM
migrations and the AI service applies its Alembic migration (creates the
`vector` extension and chatbot tables).

Create the first CMS admin (uses the `SEED_ADMIN_*` values from `.env.prod`):

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec backend pnpm run seed:prod
```

Open:

- Website: `http://YOUR_IP`
- API health: `http://YOUR_IP/api/health`
- Swagger: `http://YOUR_IP/api/docs`

### Load the chatbot knowledge

Load the built-in knowledge and the website pages (automatic deploys do this
for you afterwards):

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec ai-service python -c "from app.services.sync_service import full_sync; print(full_sync(force=True))"
```

Published CMS content syncs on every save. To resend all of it, call
`POST /api/chatbot/reindex` from Swagger (authorize with the admin JWT).

## Deploying updates (automatic)

Every merge or push to `main` deploys itself through
`.github/workflows/deploy.yml`:

1. GitHub builds only the folders that changed (`backend`, `frontend`,
   `ai-service`). If a build fails, nothing reaches the server.
2. GitHub connects to the Droplet over SSH and runs `deploy.sh`, which:
   - checks out the new `main` commit (`.env.prod` is never touched);
   - rebuilds only the changed services, one at a time;
   - restarts containers and waits for the API, website and AI service to respond;
   - runs database migrations and the admin seed (both skip if there is nothing to do);
   - syncs the chatbot with the website text (skipped automatically if the text is unchanged);
   - removes unused images and build cache older than 7 days.

A failed build leaves the live site on the previous version.

To redeploy by hand: GitHub → Actions → **Deploy to production** → **Run
workflow**. Tick **Rebuild every service** to rebuild all images, or **Force a
full chatbot re-embed** to refresh the chatbot. The same script works on the
server:

```bash
bash /opt/hcg/deploy.sh
REBUILD_ALL=true REINDEX_CHATBOT=true bash /opt/hcg/deploy.sh
```

### One-time setup for automatic deploys

1. On the server, create a key that GitHub Actions uses to log in:

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N "" -C "github-actions-deploy"
   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/github_actions
   ```

2. In GitHub → the repo → Settings → Secrets and variables → Actions → **New
   repository secret**, add:

   | Secret           | Value                                                    |
   |------------------|----------------------------------------------------------|
   | `DEPLOY_HOST`    | `YOUR_IP`                                                |
   | `DEPLOY_USER`    | `root`                                                   |
   | `DEPLOY_SSH_KEY` | The whole private key printed above, including the `-----BEGIN` and `-----END` lines |

The server fetches code with GitHub's temporary job token, so it doesn't need
its own GitHub credentials. CMS content syncs to the chatbot on every save, so
it needs no deploy.

## Useful commands

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f <service>   # frontend | backend | ai-service | nginx | postgres
docker compose --env-file .env.prod -f docker-compose.prod.yml restart <service>
docker compose --env-file .env.prod -f docker-compose.prod.yml exec postgres psql -U hcg -d hcg_db
```

## Database backups

```bash
cd /opt/hcg
mkdir -p backups
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres pg_dump -U hcg -d hcg_db | gzip > backups/hcg_$(date +%F).sql.gz
```

Restore:

```bash
gunzip -c backups/hcg_YYYY-MM-DD.sql.gz | docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres psql -U hcg -d hcg_db
```

## Domain and HTTPS

The site is served at `https://www.hcgfoundation.org`. `nginx/default.conf`
redirects plain HTTP, the bare domain and the IP there, and expects the
certificate at `certbot/conf/live/hcgfoundation.org/`. **nginx does not start
without that certificate**, so on a new server issue it before deploying this
config (with an HTTP-only `default.conf` that serves `/.well-known/acme-challenge/`).

1. DNS: an **A record** `@` → `YOUR_IP` and a **CNAME** `www` → `hcgfoundation.org`
   (no AAAA record pointing elsewhere).
2. Issue the certificate:

   ```bash
   cd /opt/hcg
   docker compose --env-file .env.prod -f docker-compose.prod.yml --profile certbot run --rm certbot certonly \
     --webroot -w /var/www/certbot -d hcgfoundation.org -d www.hcgfoundation.org \
     --email hcgfoundation@gmail.com --agree-tos --no-eff-email
   ```

3. Set `PUBLIC_URL=https://www.hcgfoundation.org` in `.env.prod`. The frontend
   bakes this in at build time, so rebuild it:

   ```bash
   docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build frontend ai-service
   docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --force-recreate nginx
   ```

4. Renew certificates automatically (root crontab, `crontab -e`):

   ```
   0 3 * * 1 cd /opt/hcg && docker compose --env-file .env.prod -f docker-compose.prod.yml --profile certbot run --rm certbot renew && docker compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload
   ```

Use HTTPS before switching Razorpay to live keys.
