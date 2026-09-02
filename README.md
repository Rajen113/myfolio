# MyFolio — Professional Portfolio Platform

MyFolio is a SaaS platform allowing developers and creators to build, customize, and publish professional portfolio websites dynamically without writing deployment code or managing separate web servers.

Every user's portfolio is dynamically served from a central PostgreSQL database using Next.js App Router dynamic routing (`myfolio.com/[username]`), wildcard subdomains (`username.myfolio.com`), and custom domain support (`customdomain.com`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Authentication**: Auth.js (NextAuth v5) + bcryptjs
- **Validation**: Zod
- **Icons**: Lucide React
- **Containerization & Web Server**: Docker & Nginx
- **Package Manager**: npm

---

## 📁 Project Structure

```text
myfolio/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── app/
│   ├── layout.tsx                 # Root layout with Navbar, Footer, and AuthProvider
│   ├── page.tsx                   # MyFolio Landing Page (/)
│   ├── api/
│   │   ├── health/                # Liveness health check (/api/health)
│   │   ├── ready/                 # Readiness DB health check (/api/ready)
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── domains/               # Custom domain management & DNS verification
│   │   ├── messages/              # Contact form lead management
│   │   ├── portfolio/             # Portfolio settings, publishing, SEO & analytics
│   │   ├── profile/               # User profile management
│   │   ├── projects/              # Projects CRUD & reordering
│   │   ├── skills/                # Skills CRUD & reordering
│   │   ├── experience/            # Experience CRUD & reordering
│   │   ├── education/             # Education CRUD & reordering
│   │   └── resume/                # Resume builder & PDF generator
│   ├── dashboard/                 # User dashboard routes
│   └── [username]/                # Dynamic portfolio router
├── components/                    # UI Components & Portfolio Templates
├── lib/
│   ├── env.ts                     # Environment variable validation
│   ├── logger.ts                  # Production logging & PII redaction helper
│   ├── rate-limit.ts              # Sliding-window rate limiter
│   └── validations/               # Zod validation schemas
├── nginx/
│   └── default.conf               # Nginx reverse proxy configuration
├── prisma/
│   ├── schema.prisma              # Prisma schema definition
│   └── migrations/                # Versioned database migrations
├── scripts/
│   ├── smoke-test.ts              # Production smoke test suite
│   ├── test-security.ts           # Security audit test suite
│   ├── test-analytics.ts          # Analytics unit tests
│   ├── test-contact.ts            # Contact system unit tests
│   └── test-resume.ts             # Resume & PDF generator unit tests
├── Dockerfile                     # Multi-stage production Dockerfile
├── docker-compose.yml             # Docker Compose orchestration
├── SECURITY.md                    # Security policy & hardening documentation
├── README.md                      # Project overview
└── docs/
    └── deployment.md              # Production deployment guide
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Set required variables in `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/myfolio?schema=public"
AUTH_SECRET="super-secret-random-key-myfolio-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the full test suite (smoke tests, security tests, analytics tests, contact tests, resume PDF tests):

```bash
# Run all unit and smoke test suites
npm test

# Run TypeScript compilation check
npm run typecheck

# Run ESLint check
npm run lint

# Validate production build
npm run build
```

---

## 🐳 Production Deployment (Docker Compose)

MyFolio includes a multi-stage production `Dockerfile` and `docker-compose.yml`.

```bash
# 1. Build and start services in background
docker-compose up -d --build

# 2. Deploy database migrations
docker-compose exec app npx prisma migrate deploy

# 3. Verify health
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ready
```

For detailed production deployment instructions, Nginx reverse proxy setup, and database backup procedures, see **[docs/deployment.md](docs/deployment.md)**.
