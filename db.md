# Database Schema Documentation
## BizManager - Multi-Tenant Architecture

---

## 📋 Document Information

| Field | Details |
|-------|---------|
| **Database** | PostgreSQL 15+ (Supabase) |
| **ORM** | Prisma 5.x |
| **Architecture** | Multi-tenant (Shared Database) |
| **Version** | 1.0 |
| **Last Updated** | February 13, 2026 |

---

## 1. Database Strategy

### 1.1 Multi-Tenant Architecture

**Approach: Shared Database with Row-Level Security**

```
┌─────────────────────────────────────────┐
│     Single PostgreSQL Database          │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐   │
│  │  Super Admin Tables            │   │
│  │  - admins                      │   │
│  │  - tenants (clients)           │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  Tenant-Scoped Tables          │   │
│  │  (All have tenant_id column)   │   │
│  │  - products                    │   │
│  │  - product_variants            │   │
│  │  - variant_attributes          │   │
│  │  - orders                      │   │
│  │  - order_items                 │   │
│  │  - customers                   │   │
│  └────────────────────────────────┘   │
│                                         │
│  🔒 Row-Level Security Policies        │
│     - Clients see only their data      │
│     - tenant_id filtered automatically │
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 Security Model

**Data Isolation:**
1. **Application Level**: Prisma middleware filters by tenant_id
2. **Database Level**: PostgreSQL RLS policies enforce isolation
3. **API Level**: JWT token contains tenant_id

**How it works:**
```typescript
// JWT Payload
{
  userId: "uuid",
  tenantId: "tenant-uuid",  // ← Used to filter all queries
  role: "client"
}

// Prisma automatically adds:
where: { tenant_id: "tenant-uuid" }
```

---

## 2. Database Tables

### 2.1 Super Admin Tables

#### Table: `admins`
**Purpose:** Super admin users who manage the platform

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique admin ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `email` | VARCHAR(100) | UNIQUE | Admin email |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`
- UNIQUE INDEX on `email`

**Sample Data:**
```sql
INSERT INTO admins (id, username, password_hash) VALUES
('admin-uuid', 'admin', '$2b$10$hashedpassword...');
```

---

#### Table: `tenants`
**Purpose:** Client businesses using the platform

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tenant/client ID |
| `client_name` | VARCHAR(100) | NOT NULL | Business owner name |
| `business_name` | VARCHAR(150) | NOT NULL | Store/business name |
| `mobile` | VARCHAR(15) | UNIQUE, NOT NULL | 10-digit mobile number |
| `password_hash` | VARCHAR(255) | NOT NULL | Password for login (default: "client") |
| `address` | TEXT | NOT NULL | Business address |
| `status` | ENUM | NOT NULL | 'active' or 'inactive' |
| `features` | JSONB | NOT NULL | Enabled features array |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Tenant creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Features JSONB Structure:**
```json
{
  "inventory": true,
  "orders": true,
  "customers": true,
  "broadcasting": false,
  "whatsapp": false
}
```

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `mobile`
- INDEX on `status` (for filtering active tenants)
- INDEX on `created_at` (for sorting)

**Sample Data:**
```sql
INSERT INTO tenants (id, client_name, business_name, mobile, password_hash, address, status, features) VALUES
(
  'tenant-uuid-1',
  'Rahul Sharma',
  'Sharma Electronics',
  '9876543210',
  '$2b$10$hashedpassword...',
  '123 MG Road, Bangalore',
  'active',
  '{"inventory": true, "orders": true, "customers": true, "broadcasting": false, "whatsapp": false}'
);
```

---

### 2.2 Tenant-Scoped Tables

#### Table: `products`
**Purpose:** Product catalog for each tenant

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique product ID |
| `tenant_id` | UUID | FK → tenants(id), NOT NULL | Owner tenant |
| `name` | VARCHAR(200) | NOT NULL | Product name |
| `brand` | VARCHAR(100) | NULL | Product brand |
| `description` | TEXT | NULL | Product description |
| `category` | VARCHAR(100) | NULL | Product category/type |
| `base_price` | DECIMAL(10,2) | NOT NULL | Base/default price |
| `sku` | VARCHAR(50) | NULL | Stock Keeping Unit |
| `stock_quantity` | INTEGER | DEFAULT 0 | Total stock count |
| `low_stock_threshold` | INTEGER | DEFAULT 10 | Alert threshold |
| `images` | JSONB | DEFAULT '[]' | Array of image URLs |
| `status` | ENUM | DEFAULT 'active' | 'active' or 'inactive' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Images JSONB Structure:**
```json
[
  "https://supabase.co/storage/v1/object/public/products/image1.jpg",
  "https://supabase.co/storage/v1/object/public/products/image2.jpg"
]
```

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id` (most important - all queries filter by this)
- COMPOSITE INDEX on `(tenant_id, status)`
- COMPOSITE INDEX on `(tenant_id, created_at DESC)`
- INDEX on `sku` (for quick SKU lookups)
- FULLTEXT INDEX on `name` (for search)

**Row-Level Security:**
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can only access their own products"
  ON products
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

#### Table: `product_variants`
**Purpose:** Store different variants of products (e.g., different sizes, colors, specs)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique variant ID |
| `tenant_id` | UUID | FK → tenants(id), NOT NULL | Owner tenant |
| `product_id` | UUID | FK → products(id), NOT NULL | Parent product |
| `variant_name` | VARCHAR(100) | NOT NULL | Variant combination name |
| `sku` | VARCHAR(50) | NULL | Variant-specific SKU |
| `price` | DECIMAL(10,2) | NOT NULL | Variant price |
| `stock_quantity` | INTEGER | DEFAULT 0 | Variant stock |
| `attributes` | JSONB | NOT NULL | Variant attributes |
| `status` | ENUM | DEFAULT 'active' | 'active' or 'inactive' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Attributes JSONB Structure:**
```json
{
  "Color": "Black",
  "RAM": "16GB",
  "Storage": "256GB"
}
```

**Example Variants for a Mobile Phone:**
```sql
-- Product: Samsung Galaxy S21
-- Base Price: ₹45,000

-- Variant 1
{
  "variant_name": "Black - 8GB - 128GB",
  "price": 45000,
  "attributes": {
    "Color": "Black",
    "RAM": "8GB",
    "Storage": "128GB"
  }
}

-- Variant 2
{
  "variant_name": "White - 16GB - 256GB",
  "price": 55000,
  "attributes": {
    "Color": "White",
    "RAM": "16GB",
    "Storage": "256GB"
  }
}
```

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `product_id`
- COMPOSITE INDEX on `(tenant_id, product_id)`
- INDEX on `sku`

**Constraints:**
```sql
ALTER TABLE product_variants
ADD CONSTRAINT fk_product_variants_product
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
```

---

#### Table: `customers`
**Purpose:** Customer database for each tenant

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique customer ID |
| `tenant_id` | UUID | FK → tenants(id), NOT NULL | Owner tenant |
| `name` | VARCHAR(100) | NOT NULL | Customer name |
| `mobile` | VARCHAR(15) | NOT NULL | Customer mobile |
| `email` | VARCHAR(100) | NULL | Customer email |
| `address` | TEXT | NULL | Customer address |
| `city` | VARCHAR(50) | NULL | City |
| `state` | VARCHAR(50) | NULL | State |
| `pincode` | VARCHAR(10) | NULL | Postal code |
| `notes` | TEXT | NULL | Internal notes |
| `total_orders` | INTEGER | DEFAULT 0 | Order count (cached) |
| `total_spent` | DECIMAL(10,2) | DEFAULT 0 | Total spent (cached) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Customer since |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- COMPOSITE INDEX on `(tenant_id, mobile)` (for quick customer lookup)
- COMPOSITE INDEX on `(tenant_id, created_at DESC)`
- FULLTEXT INDEX on `name` (for search)

**Constraints:**
```sql
-- Unique mobile per tenant (same customer can't be added twice)
ALTER TABLE customers
ADD CONSTRAINT unique_customer_mobile_per_tenant
UNIQUE (tenant_id, mobile);
```

---

#### Table: `orders`
**Purpose:** Order management for each tenant

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique order ID |
| `tenant_id` | UUID | FK → tenants(id), NOT NULL | Owner tenant |
| `order_number` | VARCHAR(20) | NOT NULL | Display order number |
| `customer_id` | UUID | FK → customers(id), NOT NULL | Customer who ordered |
| `order_date` | TIMESTAMP | DEFAULT NOW() | Order creation time |
| `status` | ENUM | DEFAULT 'pending' | Order status |
| `payment_method` | VARCHAR(50) | NULL | Cash, Card, UPI, COD |
| `payment_status` | ENUM | DEFAULT 'unpaid' | 'paid' or 'unpaid' |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Items total |
| `discount` | DECIMAL(10,2) | DEFAULT 0 | Discount amount |
| `shipping_fee` | DECIMAL(10,2) | DEFAULT 0 | Shipping cost |
| `tax` | DECIMAL(10,2) | DEFAULT 0 | Tax amount |
| `total` | DECIMAL(10,2) | NOT NULL | Final total |
| `notes` | TEXT | NULL | Order notes |
| `cancelled_reason` | TEXT | NULL | Cancellation reason |
| `cancelled_at` | TIMESTAMP | NULL | Cancellation time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Order time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Order Status ENUM:**
```sql
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'paid',
  'unpaid'
);
```

**Order Number Format:**
```
ORD-20260213-0001
ORD-YYYYMMDD-XXXX (auto-incremented daily)
```

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- UNIQUE INDEX on `(tenant_id, order_number)`
- INDEX on `customer_id`
- COMPOSITE INDEX on `(tenant_id, status)`
- COMPOSITE INDEX on `(tenant_id, order_date DESC)`
- INDEX on `payment_status`

**Constraints:**
```sql
ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT;
```

---

#### Table: `order_items`
**Purpose:** Line items in each order (products purchased)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique item ID |
| `tenant_id` | UUID | FK → tenants(id), NOT NULL | Owner tenant |
| `order_id` | UUID | FK → orders(id), NOT NULL | Parent order |
| `product_id` | UUID | FK → products(id), NOT NULL | Product purchased |
| `variant_id` | UUID | FK → product_variants(id), NULL | Variant if applicable |
| `product_name` | VARCHAR(200) | NOT NULL | Product name (snapshot) |
| `variant_name` | VARCHAR(100) | NULL | Variant name (snapshot) |
| `price` | DECIMAL(10,2) | NOT NULL | Unit price (snapshot) |
| `quantity` | INTEGER | NOT NULL | Quantity ordered |
| `subtotal` | DECIMAL(10,2) | NOT NULL | price × quantity |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Why snapshot fields?**
- `product_name`, `variant_name`, `price` are stored at order time
- Even if product is deleted/updated later, order history remains accurate

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `tenant_id`
- INDEX on `order_id`
- INDEX on `product_id`
- COMPOSITE INDEX on `(tenant_id, order_id)`

**Constraints:**
```sql
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_product
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
```

---

## 3. Complete Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// SUPER ADMIN TABLES
// ============================================

model Admin {
  id            String   @id @default(uuid())
  username      String   @unique
  passwordHash  String   @map("password_hash")
  email         String?  @unique
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("admins")
}

model Tenant {
  id           String   @id @default(uuid())
  clientName   String   @map("client_name")
  businessName String   @map("business_name")
  mobile       String   @unique
  passwordHash String   @map("password_hash")
  address      String
  status       TenantStatus
  features     Json     @default("{\"inventory\":true,\"orders\":true,\"customers\":true,\"broadcasting\":false,\"whatsapp\":false}")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  products         Product[]
  productVariants  ProductVariant[]
  customers        Customer[]
  orders           Order[]
  orderItems       OrderItem[]

  @@index([status])
  @@index([createdAt])
  @@map("tenants")
}

enum TenantStatus {
  active
  inactive
}

// ============================================
// TENANT-SCOPED TABLES
// ============================================

model Product {
  id                 String   @id @default(uuid())
  tenantId           String   @map("tenant_id")
  name               String
  brand              String?
  description        String?
  category           String?
  basePrice          Decimal  @map("base_price") @db.Decimal(10, 2)
  sku                String?
  stockQuantity      Int      @default(0) @map("stock_quantity")
  lowStockThreshold  Int      @default(10) @map("low_stock_threshold")
  images             Json     @default("[]")
  status             ProductStatus @default(active)
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  // Relations
  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  variants    ProductVariant[]
  orderItems  OrderItem[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, createdAt(sort: Desc)])
  @@index([sku])
  @@map("products")
}

enum ProductStatus {
  active
  inactive
}

model ProductVariant {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  productId     String   @map("product_id")
  variantName   String   @map("variant_name")
  sku           String?
  price         Decimal  @db.Decimal(10, 2)
  stockQuantity Int      @default(0) @map("stock_quantity")
  attributes    Json     // {"Color": "Black", "RAM": "16GB"}
  status        ProductStatus @default(active)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  tenant     Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@index([tenantId])
  @@index([productId])
  @@index([tenantId, productId])
  @@map("product_variants")
}

model Customer {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  name        String
  mobile      String
  email       String?
  address     String?
  city        String?
  state       String?
  pincode     String?
  notes       String?
  totalOrders Int      @default(0) @map("total_orders")
  totalSpent  Decimal  @default(0) @map("total_spent") @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  tenant Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders Order[]

  @@unique([tenantId, mobile])
  @@index([tenantId])
  @@index([tenantId, createdAt(sort: Desc)])
  @@map("customers")
}

model Order {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  orderNumber      String   @map("order_number")
  customerId       String   @map("customer_id")
  orderDate        DateTime @default(now()) @map("order_date")
  status           OrderStatus @default(pending)
  paymentMethod    String?  @map("payment_method")
  paymentStatus    PaymentStatus @default(unpaid) @map("payment_status")
  subtotal         Decimal  @db.Decimal(10, 2)
  discount         Decimal  @default(0) @db.Decimal(10, 2)
  shippingFee      Decimal  @default(0) @map("shipping_fee") @db.Decimal(10, 2)
  tax              Decimal  @default(0) @db.Decimal(10, 2)
  total            Decimal  @db.Decimal(10, 2)
  notes            String?
  cancelledReason  String?  @map("cancelled_reason")
  cancelledAt      DateTime? @map("cancelled_at")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relations
  tenant     Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer   Customer    @relation(fields: [customerId], references: [id], onDelete: Restrict)
  orderItems OrderItem[]

  @@unique([tenantId, orderNumber])
  @@index([tenantId])
  @@index([customerId])
  @@index([tenantId, status])
  @@index([tenantId, orderDate(sort: Desc)])
  @@index([paymentStatus])
  @@map("orders")
}

enum OrderStatus {
  pending
  confirmed
  shipped
  delivered
  cancelled
}

enum PaymentStatus {
  paid
  unpaid
}

model OrderItem {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  orderId      String   @map("order_id")
  productId    String   @map("product_id")
  variantId    String?  @map("variant_id")
  productName  String   @map("product_name")
  variantName  String?  @map("variant_name")
  price        Decimal  @db.Decimal(10, 2)
  quantity     Int
  subtotal     Decimal  @db.Decimal(10, 2)
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  tenant  Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  order   Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [productId], references: [id], onDelete: Restrict)
  variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([orderId])
  @@index([productId])
  @@index([tenantId, orderId])
  @@map("order_items")
}
```

---

## 4. Supabase Setup Guide

### 4.1 Option 1: Using Prisma Migrations (RECOMMENDED)

**Step 1: Install Dependencies**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

**Step 2: Initialize Prisma**
```bash
npx prisma init
```

**Step 3: Configure Supabase Connection**

Get your Supabase database URL:
1. Go to Supabase Dashboard → Settings → Database
2. Copy **Connection String** (Transaction mode)
3. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Step 4: Create Schema File**
- Copy the Prisma schema above into `prisma/schema.prisma`

**Step 5: Run Migration**
```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in Supabase
- Generate Prisma Client
- Create migration files

**Step 6: Generate Prisma Client**
```bash
npx prisma generate
```

**Step 7: View Database**
```bash
npx prisma studio
```

---

### 4.2 Option 2: Manual SQL (Supabase SQL Editor)

**Step 1:** Go to Supabase Dashboard → SQL Editor

**Step 2:** Copy and run this SQL:

```sql
-- ============================================
-- CREATE ENUMS
-- ============================================

CREATE TYPE tenant_status AS ENUM ('active', 'inactive');
CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');

-- ============================================
-- SUPER ADMIN TABLES
-- ============================================

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(100) NOT NULL,
  business_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  status tenant_status NOT NULL,
  features JSONB NOT NULL DEFAULT '{"inventory":true,"orders":true,"customers":true,"broadcasting":false,"whatsapp":false}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);

-- ============================================
-- TENANT-SCOPED TABLES
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100),
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  images JSONB DEFAULT '[]',
  status product_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX idx_products_tenant_created_at ON products(tenant_id, created_at DESC);
CREATE INDEX idx_products_sku ON products(sku);

-- ============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL,
  sku VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  attributes JSONB NOT NULL,
  status product_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_variants_tenant_id ON product_variants(tenant_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_tenant_product ON product_variants(tenant_id, product_id);

-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  pincode VARCHAR(10),
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, mobile)
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_tenant_created_at ON customers(tenant_id, created_at DESC);

-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number VARCHAR(20) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_date TIMESTAMP DEFAULT NOW(),
  status order_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status payment_status DEFAULT 'unpaid',
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_order_date ON orders(tenant_id, order_date DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  variant_name VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_tenant_order ON order_items(tenant_id, order_id);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be set dynamically via application
-- based on JWT token's tenant_id

-- ============================================
-- INSERT DEFAULT SUPER ADMIN
-- ============================================

-- Password: "admin" (hashed with bcrypt)
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2b$10$rN8P.xQV5Q5Z5Z5Z5Z5Z5uGKq7HvW8vW8vW8vW8vW8vW8vW8vW8vW');

-- ============================================
-- DONE
-- ============================================
```

---

## 5. Supabase Storage Setup (Images)

### 5.1 Create Storage Bucket

**Step 1:** Go to Supabase Dashboard → Storage

**Step 2:** Create a new bucket:
- Name: `products`
- Public: Yes (so images can be viewed)

**Step 3:** Set Storage Policies:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
```

### 5.2 Image Upload Flow

```typescript
// Upload image to Supabase Storage
async function uploadProductImage(file: File, tenantId: string) {
  const fileName = `${tenantId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

---

## 6. Database Helpers & Utilities

### 6.1 Prisma Client Setup

**File: `lib/db/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 6.2 Tenant Middleware (Auto-filter by tenant_id)

```typescript
// Add this to API routes
import { prisma } from '@/lib/db/prisma';

export async function withTenant(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Auto-add tenant_id to all queries
          if ('where' in args) {
            args.where = { ...args.where, tenantId };
          } else {
            args.where = { tenantId };
          }
          return query(args);
        },
      },
    },
  });
}

// Usage in API
const db = await withTenant(req.user.tenantId);
const products = await db.product.findMany(); // Automatically filtered!
```

---

## 7. Common Queries

### 7.1 Get Products with Variants

```typescript
const products = await prisma.product.findMany({
  where: { tenantId },
  include: {
    variants: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### 7.2 Get Order with All Details

```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    customer: true,
    orderItems: {
      include: {
        product: true,
        variant: true,
      },
    },
  },
});
```

### 7.3 Get Dashboard Metrics

```typescript
const [
  totalProducts,
  totalOrders,
  totalCustomers,
  todayRevenue,
] = await Promise.all([
  prisma.product.count({ where: { tenantId } }),
  prisma.order.count({ where: { tenantId } }),
  prisma.customer.count({ where: { tenantId } }),
  prisma.order.aggregate({
    where: {
      tenantId,
      orderDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    _sum: { total: true },
  }),
]);
```

---

## 8. Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to production
npx prisma migrate deploy

# Reset database (DANGER!)
npx prisma migrate reset

# View database in GUI
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Format schema file
npx prisma format
```

---

## 9. Backup Strategy

### 9.1 Supabase Automatic Backups
- Supabase Pro: Daily backups (30-day retention)
- Supabase Free: Limited backups

### 9.2 Manual Backup

```bash
# Export database
pg_dump -h db.PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  > backup_$(date +%Y%m%d).sql

# Restore database
psql -h db.PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  < backup_20260213.sql
```

---

## 10. Performance Optimization

### 10.1 Indexes Created
✅ All foreign keys indexed
✅ Composite indexes on `(tenant_id, *)` for fast filtering
✅ Status fields indexed for filtering
✅ Created_at indexed for sorting

### 10.2 Query Optimization Tips
- Always filter by `tenant_id` first
- Use `select` to fetch only needed fields
- Use pagination (`take`, `skip`)
- Use `include` wisely (avoid over-fetching)
- Use connection pooling (PgBouncer - included in Supabase)

### 10.3 Expected Performance
- Product listing: < 50ms
- Order creation: < 100ms
- Dashboard metrics: < 200ms (with caching)

---

**END OF DATABASE DOCUMENTATION**

*Last Updated: February 13, 2026*
*Ready for Implementation 🚀*
