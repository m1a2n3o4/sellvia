# Phase 5: Billing/Invoice, Multi-Store & Instagram Import

## Priority: MEDIUM-LOW
## Status: Not Started
## Depends On: Phase 1-3 completed
## Goal: Capture offline sellers, enterprise sellers, and reduce data entry for Instagram sellers

---

This phase bundles three features that target different seller segments.
Each can be built independently.

---

# PART A: Simple Billing / Invoice Generator

## A.1 PROBLEM STATEMENT

Offline sellers (Type 3) and hybrid sellers (Type 2) need a way to bill walk-in customers. Currently they pay 500-5,000/month for a POS system. If SatyaSell offers basic billing, they can drop POS for many use cases.

We are NOT building a full POS — just a simple billing screen.

## A.2 USER STORIES

1. **As a seller**, I want to select products from my inventory and generate a bill for a walk-in customer.
2. **As a seller**, I want to add customer name and phone (optional) to the bill.
3. **As a seller**, I want to apply a discount (flat or percentage) to the bill.
4. **As a seller**, I want to print or share the invoice as PDF via WhatsApp.
5. **As a seller**, I want walk-in orders to appear in my order dashboard alongside online orders.

## A.3 UI/UX DESIGN

### Billing Page (`/client/billing`)

```
┌──────────────────────────────────────────┐
│  Quick Billing                   [Clear] │
├──────────────────────────────────────────┤
│                                          │
│  🔍 Search product to add...             │  ← Autocomplete search
│                                          │
│  ITEMS                                   │
│  ┌────────────────────────────────────┐  │
│  │ Red Kurti (M)     ₹599 x 1  ₹599 │  │  ← Tap to change qty
│  │ Blue Jeans (32)   ₹899 x 2 ₹1798 │  │
│  │ Watch             ₹1299 x 1 ₹1299 │  │
│  └────────────────────────────────────┘  │
│                                          │
│  + Add item manually (name + price)      │  ← For items not in inventory
│                                          │
│  ─────────────────────────────────────── │
│  Subtotal:                      ₹3,696  │
│  Discount: [₹___] or [___%]      -₹370  │
│  Tax (GST): [0%___]               ₹0    │  ← Optional
│  ─────────────────────────────────────── │
│  TOTAL:                         ₹3,326  │
│                                          │
│  CUSTOMER (Optional)                     │
│  Name:  [_________________________]      │
│  Phone: [_________________________]      │
│                                          │
│  Payment: [Cash ▾] / UPI / Card         │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │    Generate Bill - ₹3,326        │    │
│  └──────────────────────────────────┘    │
│                                          │
│  After generating:                       │
│  [📄 Download PDF] [💬 Share WhatsApp]   │
│  [🖨️ Print]                             │
└──────────────────────────────────────────┘
```

### Invoice PDF Layout

```
┌──────────────────────────────────────────┐
│  ┌──┐  BRANDZ BAZAR                     │
│  └──┘  Hyderabad, Telangana              │
│        Phone: +91-98765-43210            │
│                                          │
│  INVOICE #INV-2026-0042                  │
│  Date: 27 Feb 2026                       │
│                                          │
│  Customer: Rahul Sharma                  │
│  Phone: +91-98765-12345                  │
│                                          │
│  ─────────────────────────────────────── │
│  # Item              Qty  Price  Amount  │
│  ─────────────────────────────────────── │
│  1 Red Kurti (M)      1   ₹599   ₹599  │
│  2 Blue Jeans (32)    2   ₹899  ₹1798  │
│  3 Watch              1  ₹1299  ₹1299  │
│  ─────────────────────────────────────── │
│                      Subtotal   ₹3,696  │
│                      Discount    -₹370  │
│                      Tax (GST)      ₹0  │
│                      ─────────────────── │
│                      TOTAL      ₹3,326  │
│                                          │
│  Payment: Cash                           │
│                                          │
│  Thank you for shopping with us!         │
│  Powered by SatyaSell                    │
└──────────────────────────────────────────┘
```

## A.4 DATABASE SCHEMA

### New Model

```prisma
model Invoice {
  id              String        @id @default(uuid())
  tenantId        String        @map("tenant_id")
  invoiceNumber   String        @map("invoice_number")
  orderId         String?       @map("order_id")        // Links to Order if created
  customerName    String?       @map("customer_name")
  customerPhone   String?       @map("customer_phone")
  items           Json          // [{name, qty, price, subtotal}]
  subtotal        Decimal       @db.Decimal(10, 2)
  discount        Decimal       @default(0) @db.Decimal(10, 2)
  discountType    String?       @map("discount_type")    // "flat" or "percent"
  tax             Decimal       @default(0) @db.Decimal(10, 2)
  taxPercent      Float?        @default(0) @map("tax_percent")
  total           Decimal       @db.Decimal(10, 2)
  paymentMethod   String?       @map("payment_method")   // cash, upi, card
  notes           String?
  createdAt       DateTime      @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, invoiceNumber])
  @@index([tenantId])
  @@index([tenantId, createdAt(sort: Desc)])
  @@map("invoices")
}
```

## A.5 STOCK MANAGEMENT FOR BILLING

### Should Billing Decrement Stock?
**YES.** When a seller generates a bill for a walk-in customer, inventory should decrease.

### Implementation
```typescript
// In billing API — after creating invoice
await prisma.$transaction(async (tx) => {
  for (const item of billItems) {
    if (item.productId) {  // Only for inventory items, not manual items
      await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQuantity: { gte: item.quantity }
        },
        data: {
          stockQuantity: { decrement: item.quantity }
        }
      });
    }
  }

  // Create invoice
  const invoice = await tx.invoice.create({ ... });

  // Also create an Order record (type: 'offline') so it appears in dashboard
  const order = await tx.order.create({
    data: {
      tenantId,
      orderType: 'offline',
      status: 'delivered',    // Walk-in = immediately delivered
      paymentStatus: 'paid',  // Cash received at counter
      // ... other fields
    }
  });

  return { invoice, order };
});
```

### Manual Items (Not in Inventory)
- Items added via "Add item manually" (not from inventory) do NOT affect stock
- These are one-off items the seller types in (e.g., "Gift Wrapping ₹50")
- Stored in Invoice.items JSON but not linked to any Product

### Bill Cancellation / Return
- If seller cancels a bill → restore stock for inventory items
- Add "Cancel Bill" button on invoice detail page
- Cancelled invoices shown with strikethrough in invoice list

## A.6 BARCODE / QR SCANNER (Future Enhancement)

### Use Case
Walk-in customer brings 5 items to counter. Instead of searching each product by name, seller scans the barcode/QR with phone camera.

### Implementation (Future)
1. Add `barcode` field to Product model (already have `sku` which can serve as barcode)
2. Use `html5-qrcode` or `quagga2` library for browser-based barcode scanning
3. Seller taps "Scan" button → camera opens → scan barcode → product auto-added to bill

### Why Future
- Requires sellers to print barcodes/QR codes for their products
- Most small sellers don't have barcode printers yet
- SKU-based search is sufficient for now
- Can be added as a quick enhancement once billing is stable

## A.7 TECHNICAL IMPLEMENTATION

### New Files
```
app/client/billing/page.tsx              # Billing page
app/api/client/invoices/route.ts         # GET: list, POST: create invoice
app/api/client/invoices/[id]/route.ts    # GET: invoice detail
app/api/client/invoices/[id]/pdf/route.ts # GET: download PDF
components/billing/billing-form.tsx       # Billing form component
components/billing/item-search.tsx        # Product autocomplete
components/billing/invoice-preview.tsx    # Invoice PDF preview
lib/invoice/pdf-generator.ts             # Generate PDF (using @react-pdf/renderer or jsPDF)
```

### Dependencies
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2"
}
```

---

# PART B: Multi-Store Management

## B.1 PROBLEM STATEMENT

Some business owners have multiple stores/brands. Currently, SatyaSell supports one store per tenant account. These owners need to manage multiple stores from a single login.

## B.2 USER STORIES

1. **As a business owner**, I want to create multiple stores under one account.
2. **As a business owner**, I want each store to have its own inventory, orders, and WhatsApp number.
3. **As a business owner**, I want to switch between stores easily.
4. **As a business owner**, I want a combined dashboard showing metrics across all stores.
5. **As a business owner**, I want to assign staff to specific stores.

## B.3 ARCHITECTURE APPROACH

### Option A: Multiple Tenants Per User (Recommended)
- Create a new `User` model (separate from Tenant)
- A User can own multiple Tenants (stores)
- Each Tenant keeps its own inventory, orders, customers
- User switches between tenants via a dropdown

```
User (manohar@email.com)
├── Tenant: "Brandz Bazar Hyderabad"  (tenantId: abc)
│   ├── Products, Orders, Customers, WhatsApp
├── Tenant: "Brandz Bazar Bangalore"  (tenantId: def)
│   ├── Products, Orders, Customers, WhatsApp
└── Tenant: "RTX Electronics"         (tenantId: ghi)
    ├── Products, Orders, Customers, WhatsApp
```

### Why This Approach
- **Zero changes to existing data model** — every table already uses tenantId
- Only add a User→Tenant mapping
- Existing queries don't change at all
- Each store is fully isolated

## B.4 DATABASE SCHEMA

### New / Modified Models

```prisma
// NEW: User model (store owner who can have multiple stores)
model User {
  id           String   @id @default(uuid())
  name         String
  mobile       String   @unique
  email        String?  @unique
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  tenants UserTenant[]

  @@map("users")
}

// NEW: Many-to-many User ↔ Tenant
model UserTenant {
  id        String          @id @default(uuid())
  userId    String          @map("user_id")
  tenantId  String          @map("tenant_id")
  role      UserTenantRole  @default(owner)
  createdAt DateTime        @default(now()) @map("created_at")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
  @@index([userId])
  @@index([tenantId])
  @@map("user_tenants")
}

enum UserTenantRole {
  owner
  manager
  staff
}

// MODIFIED: Tenant adds relation
model Tenant {
  // ... existing fields
  users UserTenant[]  // NEW
}
```

## B.5 MIGRATION FROM CURRENT AUTH SYSTEM

### Current Auth Architecture
```
Tenant model:
  - mobile (login identifier)
  - passwordHash (PIN)
  - pinChangeRequired

JWT contains: { tenantId, role: 'client' }

Login flow: mobile + OTP → verify → issue JWT with tenantId
```

### New Auth Architecture (With User Model)
```
User model:
  - mobile (login identifier)
  - passwordHash (PIN)

Tenant model:
  - NO passwordHash (moved to User)
  - NO pinChangeRequired (moved to User)

UserTenant model:
  - userId → User
  - tenantId → Tenant
  - role: owner/manager/staff

JWT contains: { userId, tenantId, role: 'client' }
```

### Migration Steps (Must Be Done Carefully)

#### Step 1: Add User model + UserTenant model
```bash
npx prisma migrate dev --name add_user_model
```
- This ADDS new tables, doesn't change existing ones

#### Step 2: Migrate existing tenants to users
```typescript
// One-time migration script
const tenants = await prisma.tenant.findMany();

for (const tenant of tenants) {
  // Create a User for each existing tenant
  const user = await prisma.user.create({
    data: {
      name: tenant.clientName,
      mobile: tenant.mobile,
      passwordHash: tenant.passwordHash,
    }
  });

  // Link user to tenant
  await prisma.userTenant.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'owner',
    }
  });
}
```

#### Step 3: Update login flow
- Login endpoint now finds User by mobile (not Tenant)
- JWT includes userId + first tenant's ID
- After login, if user has multiple tenants → show store switcher

#### Step 4: Keep backward compatibility
- Keep `mobile` and `passwordHash` on Tenant model temporarily
- Login checks User table first, falls back to Tenant table
- After all tenants are migrated → remove fields from Tenant

### Rollback Plan
If migration has issues:
- User/UserTenant tables can be dropped
- Old Tenant-based login continues to work
- No data loss since Tenant model is unchanged

## B.6 SUPER ADMIN IMPACT

### Current Super Admin Flow
```
Super admin creates tenant:
  - Enters: client name, business name, mobile, password, address
  - Creates Tenant record directly
```

### Updated Super Admin Flow
```
Super admin creates a new store:
  1. Enter mobile number
  2. Check if User exists with this mobile
     → YES: Show "Add new store for [User Name]"
     → NO: Show "Create new user + store"
  3. Enter store details (business name, address)
  4. Create Tenant + link to User via UserTenant
```

### Super Admin Dashboard Changes
- Clients page: Show User name + number of stores
- Expandable row: Click user → see all their stores
- "Add Store" button on user row → create new tenant for existing user
- Filter: "Users with multiple stores"

### Files to Modify
```
app/superadmin/clients/page.tsx           # Show users with store count
app/superadmin/clients/create/page.tsx    # Check existing user before creating
app/api/superadmin/clients/route.ts       # Create User + Tenant together
app/api/superadmin/clients/[id]/route.ts  # Edit now edits User + Tenant
```

## B.7 UI CHANGES

### Store Switcher (Dashboard Header)
```
┌─────────────────────────────────────────────┐
│ ┌──────────────────────┐                    │
│ │ Brandz Bazar HYD  ▾  │  Dashboard         │
│ │ ┌──────────────────┐ │                    │
│ │ │✅ Brandz Bazar HYD│ │                    │
│ │ │  Brandz Bazar BLR │ │                    │
│ │ │  RTX Electronics  │ │                    │
│ │ │──────────────────│ │                    │
│ │ │ + Add New Store   │ │                    │
│ │ └──────────────────┘ │                    │
│ └──────────────────────┘                    │
└─────────────────────────────────────────────┘
```

### Combined Dashboard (Optional)
```
┌──────────────────────────────────────────┐
│  All Stores Overview                     │
├──────────────────────────────────────────┤
│                                          │
│  Store           Orders  Revenue  Active │
│  Brandz HYD        45   ₹52,000   ✅    │
│  Brandz BLR        32   ₹38,000   ✅    │
│  RTX Electronics   12   ₹1,20,000 ✅    │
│  ─────────────────────────────────────── │
│  TOTAL             89   ₹2,10,000       │
│                                          │
└──────────────────────────────────────────┘
```

## B.8 TECHNICAL IMPLEMENTATION

### Files to Create/Modify
```
# New
components/layout/store-switcher.tsx     # Store dropdown switcher

# Modified
lib/auth/jwt.ts          # Include userId + active tenantId in JWT
middleware.ts             # Validate user has access to selected tenant
app/client/layout.tsx     # Add store switcher to header
app/api/client/stores/route.ts  # GET: list user's stores, POST: create new store
```

### Auth Flow Change
```
Current JWT: { tenantId, role }
New JWT:     { userId, tenantId, role }

When user switches store:
1. Frontend calls /api/client/switch-store with new tenantId
2. Backend verifies user owns that tenant
3. New JWT issued with updated tenantId
4. Page refreshes with new store context
```

---

# PART C: Instagram Import

## C.1 PROBLEM STATEMENT

Type 1 (Cloud-only) sellers post products on Instagram daily. If we auto-import posts as product drafts, we save them significant data entry time.

## C.2 TWO APPROACHES

### Approach 1: Paste Link Import (Quick — build first)
- Seller pastes an Instagram post URL in our dashboard
- We fetch the image + caption
- AI extracts product details
- Draft product created for review

### Approach 2: Auto-Sync (Full — build later)
- Seller connects Instagram account (OAuth)
- We get webhook notifications for new posts
- Auto-import new posts as draft products
- Seller reviews and publishes

## C.3 PASTE LINK IMPORT (Approach 1)

### UI Design

Add to product creation page — "Import from Instagram" option:

```
┌──────────────────────────────────────────┐
│  Import from Instagram                   │
├──────────────────────────────────────────┤
│                                          │
│  Paste Instagram Post URL:               │
│  [https://instagram.com/p/ABC123_____]   │
│                                          │
│  [Fetch Product Details]                 │
│                                          │
│  ─── After fetching: ───                 │
│                                          │
│  📷 [Product Image from Instagram]       │
│                                          │
│  Extracted Details (edit if needed):     │
│  Product Name: [Red Cotton Kurti_______] │  ← AI extracted
│  Price:        [₹599_________________]   │  ← AI extracted from caption
│  Category:     [Women's Clothing______]  │  ← AI guessed
│  Description:  [Beautiful red kurti___]  │  ← From caption
│  Brand:        [_____________________]   │  ← Empty if not detected
│  Stock:        [0_____________________]  │  ← Seller must fill
│                                          │
│  [Save as Draft]    [Publish Product]    │
└──────────────────────────────────────────┘
```

### Technical Flow

```
Seller pastes Instagram URL
        │
        ▼
Backend fetches Instagram page HTML
        │
        ▼
Extract from meta tags:
  - og:image → Product image
  - og:title / description → Caption text
        │
        ▼
Send image + caption to GPT-4o Vision:
  "Analyze this Instagram product post.
   Extract: product name, category, estimated price
   (from caption), color, material, brand"
        │
        ▼
Return extracted data as pre-filled form
        │
        ▼
Seller reviews, edits, and saves
```

### New Files
```
app/client/products/import-instagram/page.tsx     # Instagram import page
app/api/client/products/import-instagram/route.ts # POST: fetch & analyze
lib/import/instagram-parser.ts                     # Fetch Instagram metadata
```

## C.4 AUTO-SYNC (Approach 2 — Future)

### Requirements
- Facebook/Instagram Graph API integration
- Instagram Business Account required
- Meta App Review for `instagram_basic`, `instagram_content_publish` permissions
- Webhook subscription for new media

### Flow
```
1. Seller connects Instagram (OAuth in settings)
2. SatyaSell registers webhook for new posts
3. Seller posts on Instagram
4. Meta sends webhook → SatyaSell
5. We fetch post image + caption
6. AI analyzes → creates draft product
7. Seller gets notification: "New product imported from Instagram — review it"
```

### This requires:
- Meta App Review (weeks-months process)
- Instagram Business/Creator account
- Proper OAuth flow
- Webhook infrastructure

**Recommendation**: Start with Approach 1 (paste link). Add Approach 2 when we have enough Instagram sellers to justify the Meta app review process.

---

## TESTING REQUIREMENTS

### Part A: Billing
- Create invoice with multiple items
- Apply flat discount / percentage discount
- Generate PDF — verify layout and data
- Share invoice via WhatsApp
- Invoice appears in order dashboard as "offline" order
- Print invoice works

### Part B: Multi-Store
- User creates second store
- Switch between stores — data is isolated
- Orders from Store A don't appear in Store B
- Combined dashboard shows correct totals
- Staff user can only access assigned store

### Part C: Instagram Import
- Paste valid Instagram URL → image + caption extracted
- AI extracts reasonable product details
- Private/deleted post → graceful error
- Non-Instagram URL → error message
- Seller can edit all fields before saving

---

## ACCEPTANCE CRITERIA

### Part A: Billing
- [ ] Seller can search and add products to bill
- [ ] Seller can add manual items (not in inventory)
- [ ] Discount (flat/%) and tax can be applied
- [ ] Invoice PDF generated with store branding
- [ ] Invoice shareable via WhatsApp
- [ ] Invoice printable
- [ ] Orders from billing appear in dashboard as "offline" type
- [ ] Inventory stock decremented when bill is generated
- [ ] Stock restored when bill is cancelled
- [ ] Manual items (not from inventory) don't affect stock
- [ ] Bill cancellation supported with stock restoration

### Part B: Multi-Store
- [ ] One user can own multiple stores
- [ ] Store switcher in dashboard header
- [ ] Each store has isolated data
- [ ] Combined overview dashboard (optional)
- [ ] Staff roles: owner, manager, staff
- [ ] Existing tenants migrated to User model without downtime
- [ ] Login works for both old (Tenant-based) and new (User-based) accounts during transition
- [ ] Super admin can add new store for existing user
- [ ] Super admin clients page shows user → stores hierarchy

### Part C: Instagram Import
- [ ] Paste Instagram URL → extract image + caption
- [ ] AI fills product name, category, price (from caption)
- [ ] Seller can review and edit before saving
- [ ] Product saved with image from Instagram
- [ ] Works for both post and reel URLs

---

## FILES SUMMARY

### Part A: Billing (~8 new files)
```
app/client/billing/page.tsx
app/api/client/invoices/route.ts
app/api/client/invoices/[id]/route.ts
app/api/client/invoices/[id]/pdf/route.ts
components/billing/billing-form.tsx
components/billing/item-search.tsx
components/billing/invoice-preview.tsx
lib/invoice/pdf-generator.ts
```

### Part B: Multi-Store (~6 new files, ~8 modified)
```
# New
components/layout/store-switcher.tsx
app/api/client/stores/route.ts
app/api/client/switch-store/route.ts
scripts/migrate-tenants-to-users.ts    # One-time migration script

# Modified
prisma/schema.prisma                    # Add User, UserTenant models
lib/auth/jwt.ts                         # Include userId in JWT
middleware.ts                           # Validate user→tenant access
app/client/layout.tsx                   # Add store switcher to header
app/api/client/auth/route.ts            # Login finds User, not Tenant
app/superadmin/clients/page.tsx         # Show users with store count
app/superadmin/clients/create/page.tsx  # Check existing user before creating
app/api/superadmin/clients/route.ts     # Create User + Tenant together
```

### Part C: Instagram Import (~3 new files)
```
app/client/products/import-instagram/page.tsx
app/api/client/products/import-instagram/route.ts
lib/import/instagram-parser.ts
```
