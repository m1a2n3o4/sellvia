# BizManager - Multi-Tenant Business Management Platform

A modern, mobile-first business management platform built with Next.js 14, TypeScript, and Supabase.

## 🚀 Features

- **Dual Dashboard System**
  - Super Admin Dashboard for managing client tenants
  - Client Dashboard for business operations

- **Product Management**
  - Dynamic variant system supporting all product categories
  - Image upload to Supabase Storage
  - Inventory tracking

- **Order Management**
  - Manual/offline order creation
  - Order status tracking
  - Customer management

- **PWA Support**
  - Works offline
  - Installable on mobile devices
  - Native app-like experience

## 📁 Project Structure

```
/sellvia
├── /app                     # Next.js 14 app directory
│   ├── /api                # API routes
│   ├── /superadmin         # Super admin routes
│   ├── /client             # Client dashboard routes
│   └── globals.css         # Global styles
├── /components             # React components
│   ├── /superadmin
│   ├── /client
│   └── /ui                 # shadcn/ui components
├── /lib                    # Utilities
│   ├── /db                 # Prisma client
│   ├── /auth               # JWT helpers
│   ├── /supabase           # Supabase client
│   └── /utils              # Utility functions
├── /prisma                 # Database schema
│   └── schema.prisma
├── /docs                   # Documentation
│   ├── REQ.MD              # Requirements
│   ├── db.md               # Database docs
│   ├── frontend.md         # Frontend docs
│   └── backend.md          # API docs
└── /public                 # Static files
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT
- **Storage:** Supabase Storage
- **PWA:** next-pwa

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
# Database (from Supabase Dashboard → Settings → Database)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 3. Set Up Database

**Option A: Using Prisma Migrations (Recommended)**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables in Supabase)
npx prisma migrate dev --name init
```

**Option B: Using Supabase SQL Editor**

1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `docs/db.md` (Section 4.2)
3. Run it

### 4. Create Super Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Password: "admin" (hashed with bcrypt)
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2b$10$rN8P.xQV5Q5Z5Z5Z5Z5Z5uGKq7HvW8vW8vW8vW8vW8vW8vW8vW8vW');
```

Note: You'll need to properly hash the password. See `docs/backend.md` for implementation.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default Credentials

### Super Admin
- URL: http://localhost:3000/superadmin/login
- Username: `admin`
- Password: `admin`

### Client (After creating from Super Admin)
- URL: http://localhost:3000/client/login
- Mobile: `[mobile number from creation]`
- Password: `client` (default)

## 📱 PWA Setup

The app is configured as a Progressive Web App. To test:

1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Open on mobile browser
4. Click "Add to Home Screen"

## 🗄️ Database Management

```bash
# View database in GUI
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Reset database (DANGER!)
npx prisma migrate reset
```

## 📚 Documentation

- **[REQ.MD](./REQ.MD)** - Complete Product Requirements
- **[db.md](./db.md)** - Database Schema & Setup
- **[frontend.md](./frontend.md)** - Frontend Architecture
- **[backend.md](./backend.md)** - API Documentation

## 🚦 Development Phases

### ✅ Phase 1: Foundation (Current)
- [x] Project structure setup
- [x] Database schema
- [x] Basic authentication
- [x] Login pages
- [ ] Super Admin dashboard
- [ ] Client management

### 🔄 Phase 2: Product Management
- [ ] Product CRUD
- [ ] Variant system
- [ ] Image upload
- [ ] Product listing

### 🔄 Phase 3: Order & Customer Management
- [ ] Order creation
- [ ] Customer management
- [ ] Dashboard metrics

### 🔄 Phase 4: PWA & Polish
- [ ] PWA optimization
- [ ] Mobile responsiveness
- [ ] Performance optimization

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** February 13, 2026
**Version:** 1.0.0
**Status:** In Development 🚧
