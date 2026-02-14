# Backend API Documentation
## BizManager - API Specifications

---

## 📋 Document Information

| Field | Details |
|-------|---------|
| **Backend Type** | Next.js API Routes |
| **Runtime** | Node.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Version** | 1.0 |
| **Last Updated** | February 13, 2026 |

---

## 1. API Architecture

### 1.1 Overview

```
┌─────────────────────────────────────────┐
│         API Layer                       │
├─────────────────────────────────────────┤
│  Next.js API Routes (/app/api)         │
│  ├── /superadmin                       │
│  │   ├── /auth                         │
│  │   └── /clients                      │
│  └── /client                           │
│      ├── /auth                         │
│      ├── /products                     │
│      ├── /orders                       │
│      └── /customers                    │
├─────────────────────────────────────────┤
│  Middleware Layer                       │
│  ├── Authentication (JWT)              │
│  ├── Tenant Isolation                  │
│  └── Error Handling                    │
├─────────────────────────────────────────┤
│  Business Logic Layer                   │
│  ├── Product Management                │
│  ├── Order Processing                  │
│  └── Customer Management               │
├─────────────────────────────────────────┤
│  Data Access Layer                      │
│  ├── Prisma Client                     │
│  └── Supabase Client                   │
└─────────────────────────────────────────┘
```

### 1.2 Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

### 1.3 Authentication

**All client API routes require JWT token in cookie:**
```
Cookie: client_token=<JWT_TOKEN>
```

**Super Admin routes require:**
```
Cookie: superadmin_token=<JWT_TOKEN>
```

---

## 2. Super Admin APIs

### 2.1 Authentication

#### POST /api/superadmin/auth

**Purpose:** Super admin login

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-uuid",
    "username": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Implementation:**
```typescript
// File: app/api/superadmin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      userId: admin.id,
      role: 'superadmin',
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });

    response.cookies.set('superadmin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 2.2 Client Management

#### GET /api/superadmin/clients

**Purpose:** List all clients (tenants)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - Search by name/mobile
- `status` (string, optional) - Filter by 'active' or 'inactive'

**Request:**
```
GET /api/superadmin/clients?page=1&limit=20&status=active
```

**Response (200):**
```json
{
  "success": true,
  "clients": [
    {
      "id": "tenant-uuid-1",
      "clientName": "Rahul Sharma",
      "businessName": "Sharma Electronics",
      "mobile": "9876543210",
      "address": "123 MG Road, Bangalore",
      "status": "active",
      "features": {
        "inventory": true,
        "orders": true,
        "customers": true,
        "broadcasting": false,
        "whatsapp": false
      },
      "createdAt": "2026-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Implementation:**
```typescript
// File: app/api/superadmin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [clients, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        select: {
          id: true,
          clientName: true,
          businessName: true,
          mobile: true,
          address: true,
          status: true,
          features: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### POST /api/superadmin/clients

**Purpose:** Create a new client (tenant)

**Request:**
```json
{
  "clientName": "Rahul Sharma",
  "businessName": "Sharma Electronics",
  "mobile": "9876543210",
  "address": "123 MG Road, Bangalore",
  "status": "active",
  "features": {
    "inventory": true,
    "orders": true,
    "customers": true,
    "broadcasting": false,
    "whatsapp": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "client": {
    "id": "tenant-uuid-1",
    "clientName": "Rahul Sharma",
    "businessName": "Sharma Electronics",
    "mobile": "9876543210",
    "credentials": {
      "mobile": "9876543210",
      "password": "client"
    }
  }
}
```

**Implementation:**
```typescript
// File: app/api/superadmin/clients/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, businessName, mobile, address, status, features } = body;

    // Validate unique mobile
    const existing = await prisma.tenant.findUnique({
      where: { mobile },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Mobile number already exists' },
        { status: 400 }
      );
    }

    // Hash default password "client"
    const passwordHash = await bcrypt.hash('client', 10);

    // Create tenant
    const client = await prisma.tenant.create({
      data: {
        clientName,
        businessName,
        mobile,
        passwordHash,
        address,
        status,
        features,
      },
    });

    return NextResponse.json(
      {
        success: true,
        client: {
          id: client.id,
          clientName: client.clientName,
          businessName: client.businessName,
          mobile: client.mobile,
          credentials: {
            mobile: client.mobile,
            password: 'client',
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### PUT /api/superadmin/clients/[id]

**Purpose:** Update client details

**Request:**
```json
{
  "clientName": "Rahul Kumar",
  "status": "inactive",
  "features": {
    "inventory": true,
    "orders": false,
    "customers": true,
    "broadcasting": true,
    "whatsapp": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "client": {
    "id": "tenant-uuid-1",
    "clientName": "Rahul Kumar",
    "status": "inactive"
  }
}
```

---

#### DELETE /api/superadmin/clients/[id]

**Purpose:** Delete a client (with confirmation)

**Response (200):**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

**Note:** This will CASCADE delete all tenant data (products, orders, customers).

---

## 3. Client APIs

### 3.1 Authentication

#### POST /api/client/auth

**Purpose:** Client login

**Request:**
```json
{
  "mobile": "9876543210",
  "password": "client"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "mobile": "9876543210",
    "businessName": "Sharma Electronics",
    "tenantId": "tenant-uuid-1",
    "features": {
      "inventory": true,
      "orders": true,
      "customers": true
    }
  }
}
```

**Implementation:**
```typescript
// File: app/api/client/auth/route.ts
export async function POST(request: NextRequest) {
  try {
    const { mobile, password } = await request.json();

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { mobile },
    });

    if (!tenant || tenant.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, tenant.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      userId: tenant.id,
      tenantId: tenant.id,
      role: 'client',
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: tenant.id,
        mobile: tenant.mobile,
        businessName: tenant.businessName,
        tenantId: tenant.id,
        features: tenant.features,
      },
    });

    response.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 3.2 Products

#### GET /api/client/products

**Purpose:** List all products for the authenticated client

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)
- `category` (string, optional)
- `status` (string, optional)
- `sort` (string, optional) - 'name_asc', 'name_desc', 'price_asc', 'price_desc'

**Request:**
```
GET /api/client/products?page=1&limit=20&status=active&sort=name_asc
```

**Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "id": "product-uuid-1",
      "name": "Samsung Galaxy S21",
      "brand": "Samsung",
      "category": "Mobile",
      "basePrice": 45000,
      "stockQuantity": 20,
      "images": [
        "https://supabase.co/storage/v1/object/public/products/image1.jpg"
      ],
      "status": "active",
      "variants": [
        {
          "id": "variant-uuid-1",
          "variantName": "Black - 8GB - 128GB",
          "price": 45000,
          "stockQuantity": 10,
          "attributes": {
            "Color": "Black",
            "RAM": "8GB",
            "Storage": "128GB"
          }
        }
      ],
      "createdAt": "2026-02-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Implementation:**
```typescript
// File: app/api/client/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || 'createdAt_desc';

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    // Parse sorting
    const [sortField, sortOrder] = sort.split('_');
    const orderBy: any = {};
    orderBy[sortField] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### POST /api/client/products

**Purpose:** Create a new product

**Request:**
```json
{
  "name": "Samsung Galaxy S21",
  "brand": "Samsung",
  "description": "Latest flagship smartphone",
  "category": "Mobile",
  "basePrice": 45000,
  "stockQuantity": 20,
  "images": [
    "https://supabase.co/storage/v1/object/public/products/image1.jpg"
  ],
  "status": "active",
  "variants": [
    {
      "variantName": "Black - 8GB - 128GB",
      "price": 45000,
      "stockQuantity": 10,
      "attributes": {
        "Color": "Black",
        "RAM": "8GB",
        "Storage": "128GB"
      }
    },
    {
      "variantName": "White - 16GB - 256GB",
      "price": 55000,
      "stockQuantity": 10,
      "attributes": {
        "Color": "White",
        "RAM": "16GB",
        "Storage": "256GB"
      }
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "product": {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S21",
    "variants": [
      {
        "id": "variant-uuid-1",
        "variantName": "Black - 8GB - 128GB"
      }
    ]
  }
}
```

**Implementation:**
```typescript
// File: app/api/client/products/route.ts
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();

    const { variants, ...productData } = body;

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        ...productData,
        tenantId,
        variants: {
          create: variants.map((v: any) => ({
            ...v,
            tenantId,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### GET /api/client/products/[id]

**Purpose:** Get a single product by ID

**Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S21",
    "brand": "Samsung",
    "description": "Latest flagship smartphone",
    "category": "Mobile",
    "basePrice": 45000,
    "stockQuantity": 20,
    "images": ["..."],
    "status": "active",
    "variants": [...],
    "createdAt": "2026-02-10T10:30:00Z",
    "updatedAt": "2026-02-10T10:30:00Z"
  }
}
```

---

#### PUT /api/client/products/[id]

**Purpose:** Update a product

**Request:**
```json
{
  "name": "Samsung Galaxy S21 Ultra",
  "basePrice": 50000,
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S21 Ultra"
  }
}
```

---

#### DELETE /api/client/products/[id]

**Purpose:** Delete a product

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 3.3 Orders

#### GET /api/client/orders

**Purpose:** List all orders

**Query Parameters:**
- `page`, `limit`, `search`
- `status` (pending, confirmed, shipped, delivered, cancelled)
- `paymentStatus` (paid, unpaid)
- `dateFrom`, `dateTo` (ISO date strings)

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid-1",
      "orderNumber": "ORD-20260213-0001",
      "customer": {
        "id": "customer-uuid-1",
        "name": "Amit Kumar",
        "mobile": "9988776655"
      },
      "orderDate": "2026-02-13T14:30:00Z",
      "status": "pending",
      "paymentMethod": "Cash",
      "paymentStatus": "paid",
      "total": 85100,
      "createdAt": "2026-02-13T14:30:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### POST /api/client/orders

**Purpose:** Create a new order (manual/offline)

**Request:**
```json
{
  "customerId": "customer-uuid-1",
  "items": [
    {
      "productId": "product-uuid-1",
      "variantId": "variant-uuid-1",
      "quantity": 2
    }
  ],
  "discount": 5000,
  "shippingFee": 100,
  "tax": 0,
  "paymentMethod": "Cash",
  "paymentStatus": "paid",
  "notes": "Customer paid in cash"
}
```

**Response (201):**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid-1",
    "orderNumber": "ORD-20260213-0001",
    "total": 85100,
    "status": "pending"
  }
}
```

**Implementation:**
```typescript
// File: app/api/client/orders/route.ts
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();

    const { customerId, items, discount, shippingFee, tax, paymentMethod, paymentStatus, notes } = body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      let price = product.basePrice;
      let variantName = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          price = variant.price;
          variantName = variant.variantName;
        }
      }

      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        variantName,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        tenantId,
      });

      // Decrease stock
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    const total = subtotal - discount + shippingFee + tax;

    // Generate order number
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const orderCount = await prisma.order.count({
      where: {
        tenantId,
        orderDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const orderNumber = `ORD-${today}-${String(orderCount + 1).padStart(4, '0')}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId,
        status: 'pending',
        paymentMethod,
        paymentStatus,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        notes,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        orderItems: true,
      },
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalOrders: {
          increment: 1,
        },
        totalSpent: {
          increment: total,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### GET /api/client/orders/[id]

**Purpose:** Get order details

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid-1",
    "orderNumber": "ORD-20260213-0001",
    "customer": {
      "name": "Amit Kumar",
      "mobile": "9988776655",
      "address": "..."
    },
    "orderItems": [
      {
        "productName": "Samsung Galaxy S21",
        "variantName": "Black - 8GB - 128GB",
        "price": 45000,
        "quantity": 2,
        "subtotal": 90000
      }
    ],
    "status": "pending",
    "paymentMethod": "Cash",
    "paymentStatus": "paid",
    "subtotal": 90000,
    "discount": 5000,
    "shippingFee": 100,
    "total": 85100,
    "notes": "Customer paid in cash",
    "createdAt": "2026-02-13T14:30:00Z"
  }
}
```

---

#### PATCH /api/client/orders/[id]/status

**Purpose:** Update order status

**Request:**
```json
{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid-1",
    "status": "confirmed",
    "updatedAt": "2026-02-13T15:00:00Z"
  }
}
```

---

#### DELETE /api/client/orders/[id]

**Purpose:** Cancel an order

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

**Note:** This restores product stock.

---

### 3.4 Customers

#### GET /api/client/customers

**Purpose:** List all customers

**Query Parameters:**
- `page`, `limit`, `search`

**Response (200):**
```json
{
  "success": true,
  "customers": [
    {
      "id": "customer-uuid-1",
      "name": "Amit Kumar",
      "mobile": "9988776655",
      "email": "amit@example.com",
      "address": "456 Park Street, Delhi",
      "totalOrders": 5,
      "totalSpent": 125000,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### POST /api/client/customers

**Purpose:** Create a new customer

**Request:**
```json
{
  "name": "Amit Kumar",
  "mobile": "9988776655",
  "email": "amit@example.com",
  "address": "456 Park Street, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

**Response (201):**
```json
{
  "success": true,
  "customer": {
    "id": "customer-uuid-1",
    "name": "Amit Kumar",
    "mobile": "9988776655"
  }
}
```

---

#### GET /api/client/customers/[id]

**Purpose:** Get customer details with order history

**Response (200):**
```json
{
  "success": true,
  "customer": {
    "id": "customer-uuid-1",
    "name": "Amit Kumar",
    "mobile": "9988776655",
    "email": "amit@example.com",
    "address": "456 Park Street, Delhi",
    "totalOrders": 5,
    "totalSpent": 125000,
    "orders": [
      {
        "id": "order-uuid-1",
        "orderNumber": "ORD-20260213-0001",
        "total": 85100,
        "status": "delivered",
        "orderDate": "2026-02-13T14:30:00Z"
      }
    ]
  }
}
```

---

### 3.5 Dashboard

#### GET /api/client/dashboard/metrics

**Purpose:** Get dashboard overview metrics

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "totalProducts": 50,
    "activeProducts": 45,
    "totalOrders": 120,
    "todayOrders": 5,
    "thisWeekOrders": 25,
    "thisMonthOrders": 80,
    "totalCustomers": 150,
    "lowStockCount": 8,
    "todayRevenue": 45000,
    "thisMonthRevenue": 850000
  }
}
```

**Implementation:**
```typescript
// File: app/api/client/dashboard/metrics/route.ts
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      thisWeekOrders,
      thisMonthOrders,
      totalCustomers,
      lowStockProducts,
      todayRevenue,
      thisMonthRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId, status: 'active' } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId, orderDate: { gte: today } } }),
      prisma.order.count({ where: { tenantId, orderDate: { gte: thisWeek } } }),
      prisma.order.count({ where: { tenantId, orderDate: { gte: thisMonth } } }),
      prisma.customer.count({ where: { tenantId } }),
      prisma.product.count({
        where: {
          tenantId,
          stockQuantity: { lt: 10 },
        },
      }),
      prisma.order.aggregate({
        where: { tenantId, orderDate: { gte: today } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { tenantId, orderDate: { gte: thisMonth } },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        totalProducts,
        activeProducts,
        totalOrders,
        todayOrders,
        thisWeekOrders,
        thisMonthOrders,
        totalCustomers,
        lowStockCount: lowStockProducts,
        todayRevenue: todayRevenue._sum.total || 0,
        thisMonthRevenue: thisMonthRevenue._sum.total || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. File Upload

### POST /api/upload

**Purpose:** Upload image to Supabase Storage

**Request:** FormData with file

**Response (200):**
```json
{
  "success": true,
  "url": "https://supabase.co/storage/v1/object/public/products/tenant-uuid/1708000000-image.jpg"
}
```

**Implementation:**
```typescript
// File: app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantId } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 5. Error Handling

### 5.1 Standard Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 6. Authentication Helpers

### File: `lib/auth/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function signJWT(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export async function verifyJWT(token: string) {
  return jwt.verify(token, SECRET);
}
```

### File: `lib/auth/middleware.ts`

```typescript
import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';

export async function getTenantId(request: NextRequest): Promise<string> {
  const token = request.cookies.get('client_token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  const payload: any = await verifyJWT(token);

  if (!payload.tenantId) {
    throw new Error('Invalid token');
  }

  return payload.tenantId;
}
```

---

## 7. Environment Variables

**File: `.env.local`**

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 8. API Testing (Postman)

### Collection Structure:

```
BizManager API
├── Super Admin
│   ├── Login
│   ├── List Clients
│   ├── Create Client
│   ├── Update Client
│   └── Delete Client
├── Client Auth
│   └── Login
├── Products
│   ├── List Products
│   ├── Create Product
│   ├── Get Product
│   ├── Update Product
│   └── Delete Product
├── Orders
│   ├── List Orders
│   ├── Create Order
│   ├── Get Order
│   └── Update Order Status
└── Customers
    ├── List Customers
    ├── Create Customer
    └── Get Customer
```

---

## 9. API Summary Table

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/superadmin/auth` | POST | None | Super admin login |
| `/api/superadmin/clients` | GET | Super Admin | List clients |
| `/api/superadmin/clients` | POST | Super Admin | Create client |
| `/api/superadmin/clients/[id]` | PUT | Super Admin | Update client |
| `/api/superadmin/clients/[id]` | DELETE | Super Admin | Delete client |
| `/api/client/auth` | POST | None | Client login |
| `/api/client/products` | GET | Client | List products |
| `/api/client/products` | POST | Client | Create product |
| `/api/client/products/[id]` | GET | Client | Get product |
| `/api/client/products/[id]` | PUT | Client | Update product |
| `/api/client/products/[id]` | DELETE | Client | Delete product |
| `/api/client/orders` | GET | Client | List orders |
| `/api/client/orders` | POST | Client | Create order |
| `/api/client/orders/[id]` | GET | Client | Get order |
| `/api/client/orders/[id]/status` | PATCH | Client | Update order status |
| `/api/client/orders/[id]` | DELETE | Client | Cancel order |
| `/api/client/customers` | GET | Client | List customers |
| `/api/client/customers` | POST | Client | Create customer |
| `/api/client/customers/[id]` | GET | Client | Get customer |
| `/api/client/dashboard/metrics` | GET | Client | Get metrics |
| `/api/upload` | POST | Client | Upload image |

---

**END OF BACKEND DOCUMENTATION**

*Last Updated: February 13, 2026*
*Ready for API Development 🚀*
