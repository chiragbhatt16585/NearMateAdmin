## NearMate Admin

Admin panel and API monorepo for NearMate. This repo contains:

- `apps/api`: NestJS + Fastify API with Prisma (PostgreSQL)
- `apps/web`: React (Vite + Tailwind) Admin UI


## Prerequisites

- Node.js 20+
- npm 9+
- Docker Desktop (for PostgreSQL via docker-compose)


## Ports

- API: `4000`
- Web: `5173`
- PostgreSQL: `5432`
- pgAdmin: `5050`


## Quick Start

1) Install dependencies

```bash
npm install
```

2) Start the database (Postgres + pgAdmin)

```bash
npm run db:up
```

3) Configure API environment

```bash
cp apps/api/env.sample apps/api/.env
```

Generate an RSA keypair for JWT (required):

```bash
mkdir -p apps/api/keys
openssl genrsa -out apps/api/keys/jwt_private_key.pem 2048
openssl rsa -in apps/api/keys/jwt_private_key.pem -pubout -out apps/api/keys/jwt_public_key.pem
```

Edit `apps/api/.env` and set:

```env
JWT_PRIVATE_KEY_PATH="/absolute/path/to/this/repo/apps/api/keys/jwt_private_key.pem"
JWT_PUBLIC_KEY_PATH="/absolute/path/to/this/repo/apps/api/keys/jwt_public_key.pem"

# Optional: seed admin credentials
ADMIN_EMAIL=admin@nearmate.local
ADMIN_PASSWORD=admin123
```

4) Initialize database schema and seed admin

```bash
npm -w apps/api run prisma:generate
npm -w apps/api run prisma:migrate
npm -w apps/api run seed
```

5) Run the API (NestJS)

```bash
npm run dev
```

- Swagger UI: `http://localhost:4000/api/docs`

6) Run the Web app (Vite)

```bash
npm -w apps/web run dev
```

- Web UI: `http://localhost:5173`
- The web dev server proxies `/api` → `http://localhost:4000`


## Repository Structure

```
NearMateWeb/
  apps/
    api/        # NestJS API (Prisma, Auth, Categories, Items, Users)
    web/        # React Admin (Vite + Tailwind)
  docker-compose.yml  # Postgres + pgAdmin
  package.json        # Root scripts and npm workspaces
```


## Database

### Services

`docker-compose.yml` starts:

- Postgres 16 (user: `app`, password: `app`, db: `nearmateadmin`)
- pgAdmin 4 (email: `admin@example.com`, password: `admin123`)

Connect using a GUI or `psql`:

- Host: `localhost`
- Port: `5432`
- User: `app`
- Password: `app`
- Database: `nearmateadmin`

### Prisma

Common commands:

```bash
# Generate Prisma client
npm -w apps/api run prisma:generate

# Create or apply migrations (interactive name when needed)
npm -w apps/api run prisma:migrate

# Prisma Studio (DB browser)
npm -w apps/api run prisma:studio
```

The API reads `DATABASE_URL` from `apps/api/.env`.


## Running in Production-ish Mode

API:

```bash
npm run build
npm start
```

Web:

```bash
npm -w apps/web run build
npm -w apps/web run preview
```


## API Overview

- Base URL (dev): `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

Authentication:

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@nearmate.local", "password": "admin123" }
```

Response contains `accessToken` (JWT RS256). Pass it as `Authorization: Bearer <token>`.

Protected endpoints (examples):

- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `GET /api/v1/items`
- `POST /api/v1/items`


## Backups and Restore (PostgreSQL)

The database runs inside the `nearmate-postgres` container.

### Create a backup (custom dump)

```bash
# Inside container to /tmp/backup.dump
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres \
  pg_dump -Fc -d nearmateadmin -f /tmp/backup.dump

# Copy to host
docker cp nearmate-postgres:/tmp/backup.dump ./backup.dump
```

### Restore entire database from a custom dump

```bash
# Copy dump into container
docker cp ./backup.dump nearmate-postgres:/tmp/backup.dump

# Restore into existing DB (drops/recreates objects as needed)
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres \
  pg_restore --clean --no-owner --no-privileges -d nearmateadmin /tmp/backup.dump
```

### Restore only ServiceCategory (categories) from a dump

Option A: Restore only table data directly (if roles/ownership allow):

```bash
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres \
  pg_restore --data-only --no-owner --no-privileges \
  --table=public."ServiceCategory" \
  -d nearmateadmin /tmp/backup.dump
```

Option B: When direct restore fails, use a temporary DB:

```bash
# 1) Create temp DB and restore dump
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres \
  bash -lc "createdb -E UTF8 nearmateimport || true; pg_restore --no-owner --no-privileges -d nearmateimport /tmp/backup.dump"

# 2) Copy categories from temp DB to main DB
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres \
  bash -lc "pg_dump -a -t 'public."ServiceCategory"' nearmateimport | psql -d nearmateadmin"

# 3) (Optional) Drop the temp DB
docker exec -e PGUSER=app -e PGPASSWORD=app -i nearmate-postgres dropdb nearmateimport
```


## Root npm Scripts

```bash
# API (Nest) dev server
npm run dev

# API build & start
npm run build
npm start

# Database (docker compose)
npm run db:up
npm run db:down
npm run db:ps
npm run db:logs
```

Web scripts (run in workspace):

```bash
npm -w apps/web run dev
npm -w apps/web run build
npm -w apps/web run preview
```


## Troubleshooting

- "Failed to fetch" in the web app:
  - Ensure the Vite dev server is running on `5173` (`npm -w apps/web run dev`).
  - Confirm API is up on `4000` and reachable: `curl http://localhost:4000/api/v1/health`.

- "JWT private key not configured" or login fails:
  - Generate RSA keys and set `JWT_PRIVATE_KEY_PATH` (and optionally `JWT_PUBLIC_KEY_PATH`) in `apps/api/.env`.
  - Restart the API after changing `.env`.

- Database connection issues:
  - Ensure Docker is running and `npm run db:up` succeeded.
  - Verify `DATABASE_URL` in `apps/api/.env` matches docker-compose (`postgresql://app:app@localhost:5432/nearmateadmin?schema=public`).

- Reset local DB (DANGER: deletes data):
  - `npm run db:down` then `npm run db:up` and re-run Prisma migrate + seed.


## Default Admin

- Email: `admin@nearmate.local`
- Password: `admin123`

You can change these in `apps/api/.env` before running `npm -w apps/api run seed`.

