# MyFolio — Professional Portfolio Platform

MyFolio allows developers and creators to build, customize, and publish professional portfolio websites dynamically without writing deployment code or managing separate web servers.

Every user's portfolio is dynamically served from a central PostgreSQL database using Next.js App Router dynamic routing (e.g. `myfolio.com/[username]`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Authentication**: Auth.js (NextAuth v5) + bcryptjs
- **Validation**: Zod
- **Icons**: Lucide React
- **Package Manager**: npm

---

## 📁 Project Structure

```text
myfolio/
├── app/
│   ├── layout.tsx                 # Root layout with Navbar, Footer, and AuthProvider
│   ├── page.tsx                   # MyFolio Landing Page (/)
│   ├── globals.css                # Global CSS & Tailwind configuration
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts       # Auth.js API route handler
│   │   │   └── signup/
│   │   │       └── route.ts       # User registration API (bcrypt password hashing & Zod validation)
│   ├── login/
│   │   └── page.tsx               # Login page with credentials auth (/login)
│   ├── signup/
│   │   └── page.tsx               # Signup page with form validation (/signup)
│   ├── dashboard/
│   │   └── page.tsx               # Protected dashboard displaying active session data (/dashboard)
│   └── [username]/
│       └── page.tsx               # Public portfolio dynamic route (/[username])
├── components/
│   ├── AuthProvider.tsx           # Client SessionProvider wrapper
│   ├── LogoutButton.tsx           # Reusable session logout button
│   ├── Navbar.tsx                 # Dynamic top navigation bar (state-aware)
│   └── Footer.tsx                 # Platform footer
├── lib/
│   ├── auth.ts                    # Auth.js / NextAuth credentials configuration
│   ├── prisma.ts                  # Singleton Prisma Client instance
│   └── validations/
│       └── auth.ts                # Zod schemas for signup and login
├── middleware.ts                  # Route protection middleware for /dashboard
├── prisma/
│   └── schema.prisma              # Prisma schema (User model with email, username, password hash)
├── types/
│   ├── index.ts                   # TypeScript interfaces
│   └── next-auth.d.ts             # Extended NextAuth session types
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL database connection string and Auth secret:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/myfolio?schema=public"
AUTH_SECRET="super-secret-random-key-myfolio-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Run Database Migration

Ensure your PostgreSQL database server is running, then apply migrations:

```bash
# Generate Prisma Client types
npx prisma generate

# Create and apply database migration
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Authentication Flow (Step 2)

1. **User Registration (`/signup`)**:
   - Accepts Full Name, Username, Email, Password, and Password Confirmation.
   - Validated server-side via Zod schema.
   - Passwords are salted & hashed using `bcryptjs` before PostgreSQL storage.
   - Rejects duplicate emails and taken usernames.

2. **User Login (`/login`)**:
   - Authenticates using Auth.js Credentials Provider.
   - Verifies hashed passwords securely.
   - Redirects to `/dashboard` upon successful login.

3. **Protected Route (`/dashboard`)**:
   - Access restricted to authenticated users via server-side session check & middleware.
   - Unauthenticated visitors are automatically redirected to `/login`.
   - Displays actual authenticated user's Email, Username, and Full Name.

4. **User Logout**:
   - Session destroyed via `signOut()` call.
   - User redirected to `/login`.

---

## 🧪 Verification & Code Quality

Run checks:

```bash
# Check TypeScript compilation
npm run typecheck

# Check ESLint linting
npm run lint

# Build production bundle
npm run build
```
