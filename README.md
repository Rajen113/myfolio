# MyFolio — Professional Portfolio Platform

MyFolio allows developers and creators to build, customize, and publish professional portfolio websites dynamically without writing deployment code or managing separate web servers.

Every user's portfolio is dynamically served from a central PostgreSQL database using Next.js App Router dynamic routing (e.g. `myfolio.com/[username]`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Icons**: Lucide React
- **Package Manager**: npm

---

## 📁 Project Structure

```text
myfolio/
├── app/
│   ├── layout.tsx         # Root layout with Navbar and Footer
│   ├── page.tsx           # MyFolio Landing Page (/)
│   ├── globals.css        # Global CSS & Tailwind configuration
│   ├── login/
│   │   └── page.tsx       # Login page placeholder (/login)
│   ├── signup/
│   │   └── page.tsx       # Signup page placeholder (/signup)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard placeholder (/dashboard)
│   └── [username]/
│       └── page.tsx       # Public portfolio dynamic route (/[username])
├── components/
│   ├── Navbar.tsx         # Top navigation bar
│   └── Footer.tsx         # Bottom footer
├── lib/
│   └── prisma.ts          # Singleton Prisma Client instance
├── prisma/
│   └── schema.prisma      # Prisma schema (User model)
├── public/                # Static assets
├── types/
│   └── index.ts           # TypeScript type definitions
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore file
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
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

Update `.env` with your PostgreSQL database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/myfolio?schema=public"
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

## 🌐 Dynamic Dynamic Routing Showcase

Try navigating to any username route:

- [http://localhost:3000/rajenmandal](http://localhost:3000/rajenmandal)
- [http://localhost:3000/rahul](http://localhost:3000/rahul)
- [http://localhost:3000/amit](http://localhost:3000/amit)
- [http://localhost:3000/neha](http://localhost:3000/neha)

Output displayed: `Portfolio of: <username>`

---

## 🧪 Verification & Code Quality

Run checks:

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check ESLint linting
npm run lint

# Build production bundle
npm run build
```
