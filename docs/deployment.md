# MyFolio Production Deployment Guide

This document covers the end-to-end production deployment process for the **MyFolio** SaaS application.

---

## 1. Architecture Overview

```text
                     Internet
                        │
                        ▼
                 DNS / HTTPS (Nginx)
                        │
                        ▼
               Next.js App Server (:3000)
              ┌─────────┴─────────┐
              ▼                   ▼
      PostgreSQL (:5432)   Prisma Cache Tag Layer
```

* **Frontend & Server**: Next.js App Router (Standalone Node.js server)
* **Database**: PostgreSQL 16
* **Reverse Proxy**: Nginx 1.25 (handles SSL termination, wildcard subdomains, and custom domain routing)
* **Containerization**: Docker & Docker Compose

---

## 2. Environment Configuration

### Required Environment Variables

| Variable Name | Required | Default / Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | 32-byte secret key for Auth.js JWT signing |
| `NEXTAUTH_URL` | Yes | Base canonical site URL (e.g. `https://myfolio.com`) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | No | `myfolio.com` (Used for wildcard subdomains) |
| `MYFOLIO_ROOT_DOMAIN` | No | `myfolio.com` |
| `MYFOLIO_DOMAIN_TARGET` | No | `cname.myfolio.com` (Target CNAME record for user custom domains) |
| `MYFOLIO_CUSTOM_DOMAIN_ENABLED` | No | `true` |
| `NODE_ENV` | Yes | `production` |

---

## 3. Production Deployment Options

### Option A: Docker Compose Deployment (Recommended)

1. **Clone repository & prepare environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production credentials
   ```

2. **Build and start services**:
   ```bash
   docker-compose up -d --build
   ```

3. **Deploy database migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Verify container health**:
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/ready
   ```

---

### Option B: Bare-Metal Node.js Deployment

1. **Install production dependencies**:
   ```bash
   npm ci --production=false
   ```

2. **Run Prisma migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build production bundle**:
   ```bash
   npm run build
   ```

4. **Start standalone server**:
   ```bash
   npm run start
   ```

---

## 4. Reverse Proxy & DNS Setup

### Wildcard Subdomain DNS Configuration
Configure an `A` record and wildcard `CNAME` record in your DNS provider:

* `A` -> `@` -> `YOUR_SERVER_IP`
* `CNAME` -> `*` -> `myfolio.com`

### Custom Domain CNAME Target
Instruct users connecting custom domains to configure a CNAME record:

* `CNAME` -> `@` or `www` -> `cname.myfolio.com`

---

## 5. Health Checks & Monitoring

MyFolio exposes lightweight health check endpoints for load balancers and orchestrators:

* **Liveness Probe**: `GET /api/health`
  * Status 200: App process is responsive.
* **Readiness Probe**: `GET /api/ready`
  * Status 200: App process is responsive AND PostgreSQL database connection is healthy.
  * Status 503: Database disconnected.

---

## 6. Database Backup & Disaster Recovery

### Automated Daily PostgreSQL Backup Script
To set up automated PostgreSQL backups, add the following cron job (`crontab -e`):

```bash
0 2 * * * pg_dump -U postgres -h localhost -d myfolio -F c -b -v -f "/var/backups/myfolio/myfolio_$(date +\%Y\%m\%d_\%H\%M\%S).dump"
```

### Database Restoration Procedure
To restore PostgreSQL from a backup `.dump` file:

```bash
pg_restore -U postgres -h localhost -d myfolio -v "/var/backups/myfolio/myfolio_TIMESTAMP.dump"
```

---

## 7. Rollback Strategy

If a deployment fails:

1. Roll back Git commit: `git checkout <previous_stable_commit>`
2. Re-build Next.js app: `npm run build`
3. Restart process / container: `docker-compose restart app`
4. If database schema rollback is required, execute compatible down migration via Prisma.

---

## 8. Automated CI/CD Pipeline

Continuous Integration is powered by GitHub Actions (`.github/workflows/ci.yml`). Every push or pull request triggers:

1. Code checkout & dependency caching (`npm ci`).
2. Prisma Client generation (`npx prisma generate`).
3. ESLint static analysis (`npm run lint`).
4. TypeScript compile check (`npm run typecheck`).
5. Security, analytics, contact, resume, and smoke unit test suites (`npm test`).
6. Next.js production build validation (`npm run build`).
