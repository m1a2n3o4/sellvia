# Product Requirements Document (PRD)
## BizManager - Multi-Tenant CRM & E-commerce Platform

---

## 📋 Document Information

| Field | Details |
|-------|---------|
| **Version** | 1.0 |
| **Date** | February 13, 2026 |
| **Status** | Final - Ready for Development |
| **Project Name** | BizManager (Sellvia) |
| **Last Updated** | February 13, 2026 |

---

## 1. Executive Summary

### 1.1 Product Vision
BizManager is a **mobile-first, multi-tenant SaaS platform** that enables small to medium business owners to manage their inventory, orders, and customers through a unified dashboard. The platform features two distinct systems:

1. **Super Admin Dashboard** - Manage multiple client tenants
2. **Client Dashboard** - Business owners manage their operations

### 1.2 Problem Statement
Small business owners managing online and offline sales struggle with:
- Manual inventory tracking across channels
- Disorganized customer data
- No centralized order management
- Time-consuming order processing
- Need for technical expertise to set up systems

### 1.3 Target Users
- **Super Admin**: Platform owner who onboards and manages client businesses
- **Primary Users**: Small business owners (1-5 employees) selling various products (clothing, electronics, jewelry, furniture, etc.)
- **Markets**: India (initial), expanding to Southeast Asia

### 1.4 Success Metrics
- 100 active client tenants by Month 6
- Average 500 orders/month per tenant
- 70% mobile usage
- <3% churn rate
- 4.5+ star rating

---

## 2. System Architecture Overview

### 2.1 Dual Dashboard System

```
┌─────────────────────────────────────────────┐
│           BizManager Platform               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────┐    │
│  │   Super Admin Dashboard           │    │
│  │   Route: /superadmin              │    │
│  │   Login: admin / admin            │    │
│  │                                   │    │
│  │   Features:                       │    │
│  │   - Create Clients                │    │
│  │   - Edit Clients                  │    │
│  │   - Delete Clients                │    │
│  │   - Enable/Disable Features       │    │
│  │   - Status Management (ON/OFF)    │    │
│  └───────────────────────────────────┘    │
│                                             │
│  ┌───────────────────────────────────┐    │
│  │   Client Dashboard (Multi-Tenant) │    │
│  │   Route: /client                  │    │
│  │   Login: Mobile + Password        │    │
│  │                                   │    │
│  │   Features (Modular):             │    │
│  │   ✓ Product Management            │    │
│  │   ✓ Order Management              │    │
│  │   ✓ Customer Data                 │    │
│  │   ✓ Broadcasting (Future)         │    │
│  │   ✓ WhatsApp Chat (Future)        │    │
│  └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 3. Feature Specifications

### 3.1 Super Admin Dashboard

#### Route: `/superadmin`
#### Authentication: Username/Password (admin/admin)

#### Features:

##### 3.1.1 Client Management

**Create Client Form:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client Name | Text | Yes | Business owner name |
| Business Name | Text | Yes | Store/business name |
| Mobile | Text | Yes | 10-digit mobile number |
| Address | Text | Yes | Business address |
| Status | Toggle | Yes | Active/Inactive |
| Features Allowed | Checkboxes | Yes | Select enabled modules |

**Features Selection (Modular):**
- [ ] Inventory Management
- [ ] Order Management
- [ ] Customer Data
- [ ] Broadcasting (Future Phase)
- [ ] WhatsApp Chat Board (Future Phase)

**Actions:**
- Create new client
- Edit existing client details
- Delete client (with confirmation)
- Toggle client status (ON/OFF)
- Enable/disable specific features per client

**Client List View:**
- Display all clients in table format
- Columns: Business Name, Client Name, Mobile, Status, Features Count, Created Date
- Search by name/mobile
- Filter by status (Active/Inactive)
- Pagination (20 per page)

---

### 3.2 Client Dashboard

#### Route: `/client`
#### Authentication: Mobile Number + Password ("client")

#### Phase 1 Features:

##### 3.2.1 Dashboard (Overview)

**Key Metrics Cards:**
- Total Products (with active/inactive count)
- Total Orders (today, this week, this month)
- Total Customers
- Low Stock Alerts (products < 10 units)
- Revenue (today, this month)

**Recent Orders:**
- Last 10 orders
- Display: Order number, customer name, amount, status
- Click to view details

**Quick Actions:**
- Add New Product
- Create Order
- Add Customer

---

##### 3.2.2 Product Management (PRIORITY: Phase 1)

**The Challenge:**
Support ALL product categories (clothing, electronics, jewelry, furniture, gadgets, gold, watches, etc.) with different variants and pricing.

**Solution: Dynamic Product Type System**

**Product Creation Workflow:**

1. **Basic Information:**
   - Product Name (required)
   - Brand (optional)
   - Description (optional)
   - Base Price (required)
   - Stock Quantity (required)
   - Product Type/Category (dropdown)
   - Status (Active/Inactive)
   - Images (upload to Supabase Storage)

2. **Variant System:**

**Approach: Flexible Dynamic Variants**

- Clients can add unlimited custom variants
- Each variant has: Name, Value, Price Adjustment
- Stored as structured data in database
- Easy to query and display

**Example 1: Mobile Phone**
```
Product: Samsung Galaxy S21
Base Price: ₹45,000
Variants:
  - Color: Black, RAM: 8GB, Storage: 128GB → Price: ₹45,000
  - Color: White, RAM: 16GB, Storage: 256GB → Price: ₹55,000
```

**Example 2: T-Shirt**
```
Product: Cotton T-Shirt
Base Price: ₹500
Variants:
  - Size: M, Color: Blue → Price: ₹500
  - Size: XL, Color: Red → Price: ₹600
  - Size: 3XL, Color: Black → Price: ₹750
```

**Add Variant Interface:**
- "Add Variant" button
- Form fields: Variant Name, Value, Price
- Can add multiple variant combinations
- Each combination stored separately

**Product List Features:**
- Grid/List view toggle
- Search by name, SKU
- Filter by category, status
- Sort by name, price, date, stock
- Pagination (20 per page)
- Bulk actions (activate/deactivate)

---

##### 3.2.3 Order Management

**Order Listing:**
- Display: Order number, date, customer name, total amount, payment status, order status
- Filter by: Date range, Status, Payment status, Order type
- Search by: Order number, customer name, customer phone
- Status colors:
  - Pending: Yellow
  - Confirmed: Blue
  - Shipped: Purple
  - Delivered: Green
  - Cancelled: Red

**Create Manual Order (Offline Sale):**
1. Select/Add customer
2. Add products (search, select quantity)
3. Order summary (subtotal, discount, shipping, total)
4. Payment details (method, status)
5. Create order (auto-generate order number)
6. Option to print receipt

**Order Details:**
- View complete order information
- Update order status
- Edit order (if pending)
- Cancel order (restore stock)
- Print receipt

---

##### 3.2.4 Customer Management

**Customer Profile:**
- Basic info: Name, phone, email, address
- Stats: Total orders, total spent, average order value
- Order history (last 10 orders)
- Internal notes

**Customer List:**
- Search by name/phone
- Filter by date joined, order count
- View customer details
- Quick actions: Create order, Add note

---

## 4. Authentication Strategy

### 4.1 Super Admin Authentication
- **Method**: Username + Password
- **Default Credentials**: admin / admin
- **Security**: JWT token (30-day expiry)
- **Session**: Persistent login

### 4.2 Client Authentication

**Phase 1 (Current): Password-based**
- **Login Method**: Mobile Number + Password
- **Default Password**: "client"
- **Security**: JWT token with tenant_id (30-day expiry)
- **Session**: Persistent login

**Phase 2 (Future): Add OTP Option**
- **Method**: Mobile OTP via Supabase Auth
- **Flow**:
  1. Enter mobile number
  2. Receive 6-digit OTP
  3. Verify OTP
  4. Generate JWT token
- **Benefits**: More secure, no password management

**Implementation**: Both options available (Password OR OTP)

---

## 5. Technical Architecture

### 5.1 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PWA support (next-pwa)

**Backend:**
- Next.js API Routes (same repository)
- Node.js runtime

**Database:**
- PostgreSQL (Supabase)
- Prisma ORM
- Multi-tenant architecture with tenant_id
- Row-Level Security (RLS)

**Storage:**
- Supabase Storage (images)

**Authentication:**
- Custom JWT implementation
- Future: Supabase Auth for OTP

**Hosting:**
- Vercel (Frontend + API)
- Supabase (Database + Storage)

**Development Tools:**
- Git (version control)
- Postman (API testing)
- Prisma Studio (database GUI)

---

### 5.2 Repository Structure

**Single Monorepo Approach:**

```
/sellvia
  ├── /app                    # Next.js 14 app directory
  │   ├── /superadmin        # Super admin routes
  │   ├── /client            # Client dashboard routes
  │   └── /api               # API routes
  ├── /components            # Reusable React components
  │   ├── /superadmin        # Super admin components
  │   ├── /client            # Client components
  │   └── /ui                # shadcn/ui components
  ├── /lib                   # Utility functions
  │   ├── /db                # Prisma client
  │   ├── /auth              # Authentication helpers
  │   └── /supabase          # Supabase client
  ├── /prisma                # Database schema
  │   ├── schema.prisma      # Prisma schema
  │   └── /migrations        # Migration files
  ├── /docs                  # Documentation
  │   ├── REQ.MD             # This file
  │   ├── db.md              # Database documentation
  │   ├── frontend.md        # Frontend documentation
  │   └── backend.md         # API documentation
  ├── /public                # Static assets
  └── package.json           # Dependencies
```

---

### 5.3 Mobile Strategy (60% Mobile Users)

**Solution: Progressive Web App (PWA)**

**What is PWA?**
- Website that works like a native mobile app
- Users can "install" on their phone home screen
- Works offline (with service workers)
- Fast, responsive, native-like experience
- No app store required initially

**Implementation:**
1. Add `next-pwa` plugin to Next.js
2. Configure service worker
3. Add app manifest (name, icons, theme)
4. Enable "Add to Home Screen" prompt

**Benefits:**
- 0% mobile app development knowledge required
- Same codebase for web + mobile
- Instant updates (no app store approval)
- Works on iOS and Android

**Future (Phase 2): Native Apps**
- Use Capacitor to wrap PWA
- Generate iOS/Android apps
- Publish to app stores
- 95% code reuse

**Mobile-First Design:**
- Primary design: 375px width (iPhone SE)
- Responsive breakpoints: 375px, 768px, 1024px, 1280px
- Touch-friendly (minimum 44px touch targets)
- Bottom navigation on mobile
- Gestures: Pull-to-refresh, swipe actions

---

## 6. Development Roadmap

### 6.1 Development Approach: **Step-by-Step (Recommended)**

**Why?**
- Test each piece thoroughly
- Easier debugging
- Learn as you build
- Less overwhelming
- Iterative improvements

### 6.2 Phase Breakdown

#### **Phase 1: Foundation** (Weeks 1-2)
**Focus: Database + Super Admin**

1. ✅ Finalize documentation (REQ.md, db.md, frontend.md, backend.md)
2. ✅ Create Supabase database schema
3. ✅ Setup Next.js project with TypeScript
4. ✅ Configure Prisma ORM
5. ✅ Implement Super Admin Dashboard:
   - Login page
   - Client management (CRUD)
   - Feature permissions
6. ✅ Test with Supabase data

#### **Phase 2: Client Authentication** (Week 3)
1. ✅ Build client login page
2. ✅ Implement JWT authentication
3. ✅ Create middleware for route protection
4. ✅ Test login flow

#### **Phase 3: Product Management** (Weeks 4-5)
**Priority Feature**

1. ✅ Design product form UI
2. ✅ Implement variant system
3. ✅ Product CRUD APIs
4. ✅ Image upload to Supabase Storage
5. ✅ Product listing (search, filter, sort)
6. ✅ Test all product operations
7. ✅ Test with Postman

#### **Phase 4: Dashboard Overview** (Week 6)
1. ✅ Dashboard metrics API
2. ✅ Dashboard UI components
3. ✅ Recent orders widget
4. ✅ Quick actions

#### **Phase 5: Order Management** (Weeks 7-8)
1. ✅ Order creation flow
2. ✅ Order listing
3. ✅ Order details & status updates
4. ✅ Receipt printing
5. ✅ Stock management integration

#### **Phase 6: Customer Management** (Week 9)
1. ✅ Customer CRUD
2. ✅ Customer profiles
3. ✅ Order history
4. ✅ Notes system

#### **Phase 7: PWA & Mobile** (Week 10)
1. ✅ Configure next-pwa
2. ✅ Mobile-responsive design
3. ✅ Test on real devices
4. ✅ "Add to Home Screen" functionality

#### **Phase 8: Testing & Refinement** (Week 11-12)
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Bug fixes
4. ✅ User acceptance testing
5. ✅ Documentation updates

---

## 7. Database Architecture

### 7.1 Multi-Tenant Strategy

**Approach: Shared Database with tenant_id**

**How it works:**
- Single PostgreSQL database
- Every table has `tenant_id` column
- Row-Level Security (RLS) policies enforce data isolation
- Super Admin has access to all data
- Clients only see their own data

**Security:**
- Prisma queries automatically filter by tenant_id
- Middleware injects tenant_id from JWT
- PostgreSQL RLS as additional safety layer
- Impossible for Client A to access Client B's data

**Benefits:**
- Cost-effective (one database)
- Easy to manage
- Simple backups
- Scalable to 100+ tenants

**See db.md for complete schema**

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Page load time: < 2 seconds
- API response time: < 500ms (95th percentile)
- Support 100 concurrent users
- Database query time: < 100ms

### 8.2 Scalability
- Support 100+ active tenants
- Up to 10,000 products per tenant
- Up to 100,000 orders per tenant
- Up to 200,000 customers per tenant

### 8.3 Security
- HTTPS only (TLS 1.3)
- JWT tokens with expiry
- Data isolation via tenant_id + RLS
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection
- Rate limiting (100 requests/minute per IP)

### 8.4 Availability
- Uptime: 99.5% (MVP), 99.9% (Production)
- Daily automated backups (30-day retention)
- Disaster recovery within 4 hours

### 8.5 Browser Support
- Chrome (mobile/desktop): Last 2 versions ✅
- Safari (iOS): Last 2 versions ✅
- Firefox: Last 2 versions
- Edge: Last 2 versions

---

## 9. User Flows

### 9.1 Super Admin - Create Client

```
1. Navigate to /superadmin
2. Login with admin/admin
3. Click "Create Client" button
4. Fill form:
   - Client Name: "Rahul Sharma"
   - Business Name: "Sharma Electronics"
   - Mobile: "9876543210"
   - Address: "123 MG Road, Bangalore"
   - Status: Active
   - Features: ✓ Inventory, ✓ Orders, ✓ Customers
5. Click "Create Client"
6. Client created successfully
7. Client receives credentials (mobile: 9876543210, password: client)
```

### 9.2 Client - First Time Login

```
1. Navigate to /client
2. Enter mobile: 9876543210
3. Enter password: client
4. Login successful → Dashboard
5. See empty dashboard (no data)
6. Click "Add First Product"
7. Fill product form
8. Upload images
9. Save product
10. Success! Product created
```

### 9.3 Client - Create Product with Variants

```
1. Dashboard → Products → "Add Product"
2. Fill basic info:
   - Name: "Samsung Galaxy S21"
   - Brand: "Samsung"
   - Category: "Mobile"
   - Base Price: ₹45,000
   - Stock: 20
3. Upload images
4. Add Variants:
   Click "Add Variant"
   - Variant 1: Color=Black, RAM=8GB, Storage=128GB, Price=₹45,000
   Click "Add Variant"
   - Variant 2: Color=White, RAM=16GB, Storage=256GB, Price=₹55,000
5. Click "Save Product"
6. Product created with 2 variants
```

### 9.4 Client - Create Manual Order

```
1. Dashboard → Orders → "Create Order"
2. Search customer → Select "Amit Kumar" OR Add new customer
3. Add products:
   - Search "Samsung Galaxy"
   - Select variant: Black, 8GB, 128GB
   - Quantity: 2
   - Product added (₹45,000 × 2 = ₹90,000)
4. Review summary:
   - Subtotal: ₹90,000
   - Discount: -₹5,000 (manual input)
   - Shipping: ₹100
   - Total: ₹85,100
5. Payment:
   - Method: Cash
   - Status: Paid
6. Click "Create Order"
7. Order #1001 created
8. Option to print receipt
```

---

## 10. Future Enhancements (Post Phase 1)

### Phase 2: Advanced Features (Months 4-6)
- ✓ WhatsApp integration for order notifications
- ✓ Broadcasting messages to customers
- ✓ OTP authentication option
- ✓ Advanced analytics & reports
- ✓ Staff/role management
- ✓ Multi-location inventory

### Phase 3: E-commerce Storefront (Months 7-9)
- ✓ White-label storefront per client
- ✓ Subdomain routing (client1.bizmanager.com)
- ✓ Shopping cart & checkout
- ✓ Payment gateway (Razorpay)
- ✓ Customer order tracking

### Phase 4: AI Features (Months 10-12)
- ✓ AI image recognition for product creation
- ✓ Automatic categorization
- ✓ Price optimization suggestions
- ✓ Inventory forecasting

---

## 11. Success Criteria

**MVP is successful if:**
- ✅ Super Admin can create/manage 10+ clients
- ✅ Clients can add 100+ products with variants
- ✅ Clients can create 50+ orders
- ✅ Works flawlessly on mobile browsers
- ✅ Page loads < 2 seconds
- ✅ Zero data leakage between tenants
- ✅ Can install as PWA on mobile

**Business Success (Month 6):**
- 100 active client tenants
- 50,000+ orders processed
- 70% mobile usage achieved
- <3% monthly churn
- 4.5+ rating from users

---

## 12. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data leakage (tenant isolation) | High | Medium | Implement RLS, extensive testing, code reviews |
| Database performance at scale | High | Medium | Proper indexing, query optimization, monitoring |
| Mobile UX issues | Medium | High | Test on real devices, user testing, PWA best practices |
| Variant system too complex | Medium | Medium | Start simple, iterate based on feedback |
| Supabase costs spike | Medium | Low | Monitor usage, optimize queries, set budgets |

---

## 13. Glossary

- **Tenant**: A client business using the platform
- **Super Admin**: Platform owner who manages all clients
- **Multi-tenant**: Single application serving multiple clients with data isolation
- **PWA**: Progressive Web App - website that works like a mobile app
- **RLS**: Row-Level Security - database-level data isolation
- **Variant**: Different version of a product (e.g., different size/color/price)
- **JWT**: JSON Web Token - for authentication
- **ORM**: Object-Relational Mapping (Prisma) - database abstraction layer

---

## 14. Approval & Sign-off

| Role | Name | Status | Date |
|------|------|--------|------|
| Product Owner | [Your Name] | ✅ Approved | Feb 13, 2026 |
| Tech Lead | [Your Name] | ✅ Approved | Feb 13, 2026 |
| Developer | Claude AI | 🚀 Ready | Feb 13, 2026 |

---

## 15. Related Documentation

📄 **[db.md](./db.md)** - Complete Database Schema & Setup Guide
📄 **[frontend.md](./frontend.md)** - Frontend Architecture & Development Guide
📄 **[backend.md](./backend.md)** - API Documentation & Backend Guide

---

**END OF DOCUMENT**

*Last Updated: February 13, 2026*
*Version: 1.0 - Final*
*Status: Ready for Development 🚀*
