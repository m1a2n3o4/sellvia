# Frontend Architecture Documentation
## BizManager - Next.js 14 Application

---

## 📋 Document Information

| Field | Details |
|-------|---------|
| **Framework** | Next.js 14 (App Router) |
| **UI Library** | React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Version** | 1.0 |
| **Last Updated** | February 13, 2026 |

---

## 1. Tech Stack Overview

### 1.1 Core Technologies

```
┌─────────────────────────────────────────┐
│         Frontend Stack                  │
├─────────────────────────────────────────┤
│  Next.js 14 (App Router)               │
│  ├── React 18                          │
│  ├── TypeScript                        │
│  └── Server Components + Client        │
├─────────────────────────────────────────┤
│  Styling & UI                           │
│  ├── Tailwind CSS 3.x                  │
│  ├── shadcn/ui components              │
│  └── Radix UI primitives               │
├─────────────────────────────────────────┤
│  State Management                       │
│  ├── React Context                     │
│  ├── Zustand (optional)                │
│  └── React Query/SWR (data fetching)   │
├─────────────────────────────────────────┤
│  Forms & Validation                     │
│  ├── React Hook Form                   │
│  └── Zod (schema validation)           │
├─────────────────────────────────────────┤
│  Mobile/PWA                             │
│  ├── next-pwa                          │
│  ├── Service Workers                   │
│  └── Manifest.json                     │
└─────────────────────────────────────────┘
```

### 1.2 Dependencies

**package.json:**
```json
{
  "name": "sellvia",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.9.0",
    "@supabase/supabase-js": "^2.39.0",

    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",

    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",

    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",

    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.316.0",

    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",

    "zustand": "^4.5.0",
    "swr": "^2.2.4",

    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.5",

    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "prisma": "^5.9.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 2. Project Structure

### 2.1 Folder Organization

```
/sellvia
├── /app                          # Next.js 14 App Directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (/)
│   │
│   ├── /superadmin              # Super Admin Routes
│   │   ├── layout.tsx           # Super admin layout
│   │   ├── page.tsx             # Dashboard (/superadmin)
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── clients/
│   │   │   ├── page.tsx         # Client list
│   │   │   ├── create/
│   │   │   │   └── page.tsx     # Create client
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Edit client
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── loading.tsx          # Loading state
│   │
│   ├── /client                  # Client Dashboard Routes
│   │   ├── layout.tsx           # Client layout
│   │   ├── page.tsx             # Dashboard (/client)
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   │
│   │   ├── /products
│   │   │   ├── page.tsx         # Product list
│   │   │   ├── create/
│   │   │   │   └── page.tsx     # Create product
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # View product
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit product
│   │   │
│   │   ├── /orders
│   │   │   ├── page.tsx         # Order list
│   │   │   ├── create/
│   │   │   │   └── page.tsx     # Create order
│   │   │   └── [id]/
│   │   │       └── page.tsx     # View order
│   │   │
│   │   ├── /customers
│   │   │   ├── page.tsx         # Customer list
│   │   │   ├── create/
│   │   │   │   └── page.tsx     # Create customer
│   │   │   └── [id]/
│   │   │       └── page.tsx     # View customer
│   │   │
│   │   └── /settings
│   │       └── page.tsx         # Settings
│   │
│   └── /api                     # API Routes
│       ├── /superadmin
│       │   ├── auth/
│       │   │   └── route.ts     # Super admin login
│       │   └── clients/
│       │       ├── route.ts     # List/Create clients
│       │       └── [id]/
│       │           └── route.ts # Update/Delete client
│       │
│       ├── /client
│       │   ├── auth/
│       │   │   └── route.ts     # Client login
│       │   ├── products/
│       │   │   ├── route.ts     # List/Create products
│       │   │   └── [id]/
│       │   │       └── route.ts # Get/Update/Delete product
│       │   ├── orders/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       └── route.ts
│       │   └── customers/
│       │       ├── route.ts
│       │       └── [id]/
│       │           └── route.ts
│       │
│       └── /upload
│           └── route.ts         # Image upload to Supabase
│
├── /components                  # React Components
│   ├── /superadmin
│   │   ├── ClientForm.tsx
│   │   ├── ClientList.tsx
│   │   └── SuperAdminNav.tsx
│   │
│   ├── /client
│   │   ├── ProductForm.tsx
│   │   ├── ProductList.tsx
│   │   ├── OrderForm.tsx
│   │   ├── OrderList.tsx
│   │   ├── CustomerForm.tsx
│   │   ├── DashboardMetrics.tsx
│   │   └── ClientNav.tsx
│   │
│   └── /ui                      # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── ...
│
├── /lib                         # Utilities
│   ├── /db
│   │   └── prisma.ts            # Prisma client
│   ├── /auth
│   │   ├── jwt.ts               # JWT helpers
│   │   └── middleware.ts        # Auth middleware
│   ├── /supabase
│   │   └── client.ts            # Supabase client
│   ├── /utils
│   │   ├── cn.ts                # Tailwind merge utility
│   │   └── format.ts            # Date/currency formatters
│   └── /validations
│       ├── product.ts           # Zod schemas
│       ├── order.ts
│       └── customer.ts
│
├── /hooks                       # Custom React Hooks
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── useToast.ts
│
├── /types                       # TypeScript Types
│   ├── index.ts
│   ├── auth.ts
│   ├── product.ts
│   └── order.ts
│
├── /prisma
│   ├── schema.prisma
│   └── /migrations
│
├── /public                      # Static Files
│   ├── /icons
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json            # PWA manifest
│   └── favicon.ico
│
├── .env.local                   # Environment variables
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## 3. Routing Strategy

### 3.1 Route Structure

```
/ (landing)
│
├── /superadmin (Super Admin Dashboard)
│   ├── /login
│   ├── /clients
│   ├── /clients/create
│   └── /clients/[id]/edit
│
└── /client (Client Dashboard)
    ├── /login
    ├── / (dashboard)
    ├── /products
    ├── /products/create
    ├── /products/[id]
    ├── /products/[id]/edit
    ├── /orders
    ├── /orders/create
    ├── /orders/[id]
    ├── /customers
    ├── /customers/create
    ├── /customers/[id]
    └── /settings
```

### 3.2 Protected Routes (Middleware)

**File: `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Super Admin routes
  if (pathname.startsWith('/superadmin')) {
    if (pathname === '/superadmin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('superadmin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      if (payload.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }
  }

  // Client routes
  if (pathname.startsWith('/client')) {
    if (pathname === '/client/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('client_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/client/login', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      if (payload.role !== 'client') {
        return NextResponse.redirect(new URL('/client/login', request.url));
      }

      // Inject tenant_id into headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-tenant-id', payload.tenantId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/client/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*', '/client/:path*'],
};
```

---

## 4. UI Components (shadcn/ui)

### 4.1 Installation & Setup

```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
```

### 4.2 Tailwind Configuration

**File: `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## 5. Mobile-First Design (PWA)

### 5.1 Progressive Web App Setup

**File: `next.config.js`**

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['supabase.co'], // Supabase Storage
  },
};

module.exports = withPWA(nextConfig);
```

### 5.2 PWA Manifest

**File: `public/manifest.json`**

```json
{
  "name": "BizManager - Business Management Platform",
  "short_name": "BizManager",
  "description": "Manage your inventory, orders, and customers",
  "start_url": "/client",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 5.3 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 375px) { /* Mobile */ }
@media (min-width: 640px) { /* sm: Large mobile */ }
@media (min-width: 768px) { /* md: Tablet */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large desktop */ }
@media (min-width: 1536px) { /* 2xl: Extra large */ }
```

### 5.4 Mobile Navigation (Bottom Tab Bar)

**File: `components/client/MobileNav.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Settings } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/client', icon: Home, label: 'Home' },
    { href: '/client/products', icon: Package, label: 'Products' },
    { href: '/client/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/client/customers', icon: Users, label: 'Customers' },
    { href: '/client/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 6. Key Components

### 6.1 Product Form (with Variants)

**File: `components/client/ProductForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  basePrice: z.number().min(0),
  stockQuantity: z.number().min(0),
  status: z.enum(['active', 'inactive']),
});

interface Variant {
  id: string;
  attributes: Record<string, string>;
  price: number;
  stockQuantity: number;
}

export function ProductForm() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        attributes: {},
        price: 0,
        stockQuantity: 0,
      },
    ]);
  };

  const onSubmit = async (data: any) => {
    // Upload images first
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const { url } = await res.json();
        return url;
      })
    );

    // Create product with variants
    const productData = {
      ...data,
      images: imageUrls,
      variants: variants,
    };

    const res = await fetch('/api/client/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      // Success - redirect or show toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input {...register('name')} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input {...register('brand')} />
          </div>

          <div>
            <Label htmlFor="basePrice">Base Price *</Label>
            <Input type="number" {...register('basePrice', { valueAsNumber: true })} />
          </div>

          {/* More fields... */}
        </div>
      </Card>

      {/* Variants Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Variants</h2>
          <Button type="button" onClick={addVariant}>
            Add Variant
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div key={variant.id} className="border p-4 rounded mb-4">
            {/* Variant form fields */}
          </div>
        ))}
      </Card>

      {/* Image Upload */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Images</h2>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="w-full"
        />
      </Card>

      <Button type="submit" size="lg" className="w-full">
        Create Product
      </Button>
    </form>
  );
}
```

### 6.2 Dashboard Metrics

**File: `components/client/DashboardMetrics.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';

interface Metrics {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  todayRevenue: number;
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch('/api/client/dashboard/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data));
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold">{metrics.totalProducts}</p>
          </div>
          <Package className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
          </div>
          <Users className="h-8 w-8 text-purple-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Low Stock Alerts</p>
            <p className="text-2xl font-bold">{metrics.lowStockCount}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
      </Card>
    </div>
  );
}
```

---

## 7. Authentication Flow

### 7.1 Client Login Page

**File: `app/client/login/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function ClientLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error);
        setLoading(false);
        return;
      }

      const { token } = await res.json();

      // Store token in cookie
      document.cookie = `client_token=${token}; path=/; max-age=2592000`; // 30 days

      // Redirect to dashboard
      router.push('/client');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Client Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## 8. State Management

### 8.1 Auth Context

**File: `lib/auth/AuthContext.tsx`**

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  mobile: string;
  businessName: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verify token and get user data
    fetch('/api/client/auth/verify')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    document.cookie = 'client_token=; path=/; max-age=0';
    setUser(null);
    router.push('/client/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 9. Performance Optimization

### 9.1 Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={productImage}
  alt="Product"
  width={300}
  height={300}
  className="rounded-lg"
  loading="lazy"
/>
```

### 9.2 Data Fetching with SWR

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProducts() {
  const { data, error, isLoading } = useSWR('/api/client/products', fetcher);

  return {
    products: data,
    isLoading,
    error,
  };
}
```

---

## 10. UI Requirements Placeholder

**[TO BE UPDATED BY USER]**

This section will include:
- Color scheme
- Brand guidelines
- Component mockups
- Design system
- Typography
- Spacing rules

---

**END OF FRONTEND DOCUMENTATION**

*Last Updated: February 13, 2026*
*Ready for UI Design Input 🎨*
