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
git checkout DEVELOPMENT        # or the branch you want to deploy
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

After logging in to the CMS and publishing content, call
`POST /api/chatbot/reindex` from Swagger (authorize with the admin JWT) to
push CMS content and the knowledge files into pgvector.

## Deploying updates

```bash
cd /opt/hcg
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker image prune -f
```

Only changed services are rebuilt. New migrations run automatically.

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

## Adding a domain and HTTPS later

1. At your DNS provider, add an **A record** for the domain pointing to `YOUR_IP`.
2. Issue a certificate (replace the domain and email):

   ```bash
   cd /opt/hcg
   docker compose --env-file .env.prod -f docker-compose.prod.yml --profile certbot run --rm certbot certonly \
     --webroot -w /var/www/certbot -d hcgfoundation.org -d www.hcgfoundation.org \
     --email you@example.com --agree-tos --no-eff-email
   ```

3. In `nginx/default.conf`, change the port-80 server to redirect to HTTPS and
   add a `listen 443 ssl` server with the same `location` blocks plus:

   ```nginx
   ssl_certificate     /etc/letsencrypt/live/hcgfoundation.org/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/hcgfoundation.org/privkey.pem;
   ```

4. Set `PUBLIC_URL=https://hcgfoundation.org` in `.env.prod`, then:

   ```bash
   docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build frontend ai-service
   docker compose --env-file .env.prod -f docker-compose.prod.yml restart nginx
   ```

5. Renew certificates automatically (root crontab, `crontab -e`):

   ```
   0 3 * * 1 cd /opt/hcg && docker compose --env-file .env.prod -f docker-compose.prod.yml --profile certbot run --rm certbot renew && docker compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload
   ```

Use HTTPS before switching Razorpay to live keys.
