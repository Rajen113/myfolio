# Security Policy & Hardening Guidelines for MyFolio

## Supported Versions

Only the latest release of MyFolio is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a potential security vulnerability within MyFolio, please do **NOT** create a public issue. Instead, report it privately to our security team:

* **Email:** `security@myfolio.com`
* **Response SLA:** Within 24-48 hours.

Please include:
1. Type of vulnerability (e.g., IDOR, XSS, CSRF, Authorization bypass).
2. Step-by-step reproduction steps or proof-of-concept payload.
3. Affected routes or components.

---

## MyFolio Security Architecture

### 1. Authentication & Session Management
* Auth.js (NextAuth) JWT-based session strategy with server-side token validation.
* `AUTH_SECRET` and database credentials (`DATABASE_URL`) are isolated exclusively to server runtime and never exposed to client bundles or `NEXT_PUBLIC_*` variables.
* Session cookies configured with `HttpOnly`, `SameSite=Lax`, and `Secure` flags in production environments.

### 2. Authorization & IDOR Protection
* Strict server-side ownership validation (`userId: session.user.id`) enforced on **all** protected API endpoints (`/api/profile`, `/api/projects/[id]`, `/api/skills/[id]`, `/api/experience/[id]`, `/api/education/[id]`, `/api/messages/[id]`, `/api/domains/[id]`, `/api/resume/*`).
* Resource identifiers (`[id]`) cannot be manipulated to access or mutate another user's data.

### 3. Server-Side Input & URL Validation
* Zod schemas validate all inbound HTTP payloads on the server.
* External URLs (GitHub, LinkedIn, personal websites, project links, project images) are sanitized to prevent `javascript:`, `data:`, `vbscript:`, and dangerous protocol execution.

### 4. Rate Limiting & Brute-Force Protection
* In-memory sliding-window rate limiting helper (`lib/rate-limit.ts`).
* Protects sensitive and public endpoints against abuse:
  * Signup attempts (`/api/auth/signup`): Max 5 requests per 15 mins.
  * Username availability checks (`/api/username/check`): Max 60 requests per min.
  * Public contact messages (`/api/portfolio/contact`): Max 5 messages per 10 mins.
  * Analytics events (`lib/analytics/record-view.ts`): Deduplicated within 10 seconds.

### 5. Custom Domain & Host Routing Security
* Hostname normalization and validation (`lib/utils/domain.ts`).
* Reserved system domain protection prevents users from connecting `myfolio.com`, `app.myfolio.com`, or reserved subdomains.
* Cryptographic DNS TXT verification token checks prior to domain activation.

### 6. HTTP & Browser Security Headers
* Configured in `next.config.ts`:
  * `Content-Security-Policy` (CSP)
  * `X-Frame-Options: DENY` (Clickjacking protection)
  * `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy`

---

## Production Security Checklist

- [x] **Authentication:** Secure JWT sessions, secret environment variable protection, rate-limited signup.
- [x] **Authorization:** Server-side ownership checks on all private resources; IDOR protection.
- [x] **Input Validation:** Strict Zod schema parsing; safe URL protocol enforcement (`http://`, `https://`).
- [x] **XSS & HTML Injection:** No raw `dangerouslySetInnerHTML` usage; plain text rendering.
- [x] **CSRF & Origin Safety:** Protected SameSite cookie behavior; standard Next.js App Router route handling.
- [x] **Database Security:** Parameterized Prisma queries; zero unsafe raw SQL strings.
- [x] **Security Headers:** CSP, Clickjacking protection, MIME sniffing protection.
- [x] **Secrets Management:** Secrets omitted from git repository and client-side code bundles.
