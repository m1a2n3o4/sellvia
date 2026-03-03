# SatyaSell - Master Plan

## Document Version: 1.0
## Date: 27 Feb 2026
## Status: Draft - Pending Review

---

## 1. PRODUCT VISION

SatyaSell is a **one-stop commerce platform** for Indian small & medium sellers that combines:
1. **WhatsApp AI Auto-Ordering** (our unique differentiator)
2. **Online Storefront** (per-seller website)
3. **Simple Billing/Invoice** (for walk-in customers)

All powered by **one dashboard, one inventory, one database**.

### One-Line Pitch
> "Dukaan gives you a website. SatyaSell gives you an AI salesperson that works 24/7 on WhatsApp — plus a website, plus billing — and you pay nothing until you earn."

---

## 2. MARKET RESEARCH (From Real Seller Demos)

### Seller Types Identified

| Type | Description | Current Tools | SatyaSell Fit |
|------|-------------|---------------|---------------|
| **Type 1: Cloud-Only** | Instagram page sellers, no offline store | WhatsApp manual ordering | BEST FIT (Primary Target) |
| **Type 2: Cloud + Offline** | Sell both online and in-store | WhatsApp + basic POS | Good fit |
| **Type 3: Offline-Only** | Store visit only | POS or paper billing | Moderate fit |
| **Type 4: Multi-Branch** | Multiple stores + online | POS + Shopify + WhatsApp | Future fit (needs multi-store) |
| **Type 5: New Starters** | Just started, looking for software | Nothing yet | BEST FIT (catch early) |

### Key Findings
- 70% of sellers already use POS with existing inventory — data entry duplication is the #1 objection
- 30% already have Shopify/e-commerce websites
- WhatsApp AI auto-ordering was liked by ALL demo participants
- Multi-store management is needed for Type 4 sellers
- Sellers pay 500-8,000/month combined for POS + Shopify

### Target Strategy
- **Phase 1 Focus**: Type 1 (Cloud-only) and Type 5 (New starters) — easiest to convert
- **Phase 2 Focus**: Type 2 (Cloud + Offline) — add billing features
- **Phase 3 Focus**: Type 3 & 4 — POS integrations & multi-store

---

## 3. COMPETITIVE ANALYSIS

### What Competitors Offer

| Feature | Dukaan | ShopWa | Bikayi | Store.link | SatyaSell |
|---------|--------|--------|--------|------------|-----------|
| Online storefront | Yes | Yes | Yes | Yes | Phase 3 |
| Product catalog | Yes | Yes | Yes | Yes | Yes (existing) |
| Cart & checkout | Yes | Yes | Yes | Yes | Phase 2-3 |
| Payment gateway | Yes | Yes | Yes | Yes | Yes (existing) |
| WhatsApp notifications | Yes | Yes | Yes | Yes | Yes (existing) |
| **WhatsApp AI selling** | No | No | No | No | **YES (UNIQUE)** |
| **Screenshot ordering** | No | No | No | No | **Phase 4 (UNIQUE)** |
| **Voice note ordering** | No | No | No | No | **YES (existing, UNIQUE)** |
| **AI image matching** | No | No | No | No | **YES (existing, UNIQUE)** |
| CSV/Excel import | Yes | No | No | Yes (Sheets) | Phase 1 |
| Billing/Invoice | Some | No | No | No | Phase 5 |
| Multi-store | Yes | No | No | No | Phase 5 |

### Our 3 Key Differentiators
1. **AI Salesperson on WhatsApp** — competitors notify, we SELL
2. **Free to start, 1% per order** — zero risk for sellers
3. **One product replaces 3 bills** — POS + Shopify + WhatsApp tool

---

## 4. PRICING MODEL

### Strategy: Free + Transaction Fee
- **Monthly fee**: FREE (zero barrier to entry)
- **Transaction fee**: 1% on each successful order
- **Future consideration**: Minimum monthly fee (e.g., 99/month + 1%) once value is proven

### Revenue Projection Example
| Sellers | Avg Orders/Month | Avg Order Value | Monthly GMV | SatyaSell Revenue (1%) |
|---------|-----------------|-----------------|-------------|----------------------|
| 100 | 200 | 500 | 10,00,000 | 10,000 |
| 500 | 200 | 500 | 5,00,00,000 | 50,000 |
| 1,000 | 200 | 500 | 10,00,00,000 | 1,00,000 |

### 1% Fee Collection — How It Works

**Option A: Payment Gateway Split (Recommended for online payments)**
- When customer pays via Razorpay/Cashfree, use **Route/Split Payment API**
- 99% goes to seller's account, 1% goes to SatyaSell's account automatically
- Seller never touches our 1% — it's deducted at payment level
- Works only for online payments (UPI, card, wallet)

**Option B: Monthly Invoice (For COD / offline orders)**
- Track all COD and offline orders in a `PlatformFee` ledger table
- At month-end, calculate total 1% owed
- Send seller a monthly invoice via WhatsApp/email
- Seller pays via UPI/bank transfer
- If unpaid for 2 months → show warning banner in dashboard

**Option C: Wallet System (Future)**
- Each seller has a SatyaSell wallet balance
- 1% is auto-deducted from wallet on every order
- Seller tops up wallet periodically
- Low balance warning → "Top up ₹500 to continue receiving orders"

**Recommended Approach**: Start with Option B (monthly invoice) since most early sellers will use COD. Add Option A (split payment) when online payment volume grows. Option C is for scale (1000+ sellers).

### Database Model for Fee Tracking
```prisma
model PlatformFee {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  orderId     String   @map("order_id")
  orderTotal  Decimal  @db.Decimal(10, 2)
  feePercent  Float    @default(1.0)
  feeAmount   Decimal  @db.Decimal(10, 2)
  status      String   @default("pending")  // pending, collected, waived
  collectedAt DateTime? @map("collected_at")
  createdAt   DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([tenantId, status])
  @@map("platform_fees")
}
```

---

## 5. CURRENT SYSTEM STATE

### What's Already Built
- Multi-tenant architecture with JWT auth
- Full product/inventory management (CRUD + variants + images)
- WhatsApp AI auto-ordering (single product per conversation)
- WhatsApp chat inbox (real-time messaging)
- Order management (create, track, update status)
- Customer management
- Payment integration (Razorpay + Cashfree)
- WhatsApp typing indicators, voice note transcription, image matching
- Owner escalation with SMS + WhatsApp alerts
- Super admin dashboard
- Landing page with demo form & visitor analytics

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4o-mini (chat + vision)
- **Auth**: JWT (jose library), HTTP-only cookies
- **Payments**: Razorpay, Cashfree
- **SMS**: Fast2SMS
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **State**: Zustand, SWR

### Database Stats
- 15 models (tables)
- Multi-tenant via tenantId on all tables
- Proper indexes for tenant-scoped queries
- Can handle 1000+ tenants with millions of orders (confirmed)

### Current Limitations
1. No CSV/Excel import — sellers must add products manually
2. No cart system — WhatsApp AI handles only 1 product per conversation
3. No storefront — customers can only order via WhatsApp
4. No billing/invoice for walk-in customers
5. No multi-store management
6. No Instagram integration

---

## 5.5 SELLER ONBOARDING FLOW

### Current Flow (Manual)
```
1. Super admin creates tenant manually
2. Seller logs in with mobile + OTP
3. Seller changes PIN
4. Seller goes to settings → adds WhatsApp credentials
5. Seller manually adds products one by one
6. Done — WhatsApp AI starts working
```

### Improved Flow (Post all phases)
```
Step 1: SIGN UP (Landing page → /client/register)
  - Enter: Name, Mobile, Business Name, Instagram link (optional)
  - Verify mobile via OTP
  - Tenant auto-created, seller logged in

Step 2: ADD PRODUCTS (Choose one)
  - Option A: Upload CSV/Excel (Phase 1) — bulk import
  - Option B: Paste Instagram link (Phase 5C) — AI extracts product
  - Option C: Add manually — existing product creation form
  - Option D: "I'll do this later" — skip

Step 3: CONNECT WHATSAPP
  - Embedded Signup flow (existing)
  - OR manual WhatsApp Business API setup
  - Skip option: "I just want the online store for now"

Step 4: ENABLE STOREFRONT (Phase 3)
  - Choose store slug (auto-suggested from business name)
  - Upload logo (optional)
  - Store goes live → shareable link generated

Step 5: START SELLING
  - Dashboard shows: "Share your store link on Instagram bio"
  - First order celebration animation
  - Tips: "Reply to WhatsApp customers to train your AI"
```

### Self-Registration (Required)
Currently, only super admin can create tenants. For scale, we need a self-registration page:
- **URL**: `/register` or `/get-started`
- **Fields**: Name, Mobile, Business Name, City
- **OTP verification** (reuse existing OTP flow)
- **Auto-create tenant** with default features enabled
- **Redirect to onboarding wizard**

This is a prerequisite for growth — should be built alongside Phase 1.

---

## 5.6 NOTIFICATION SYSTEM

### Order Notifications to Seller

When a new order is placed (from any channel), notify the seller:

| Channel | Implementation | Priority |
|---------|---------------|----------|
| **WhatsApp message** | Send order summary to seller's ownerPhone (existing infra) | HIGH — build now |
| **Dashboard real-time** | WebSocket or polling — show bell icon with badge count | MEDIUM |
| **Browser push notification** | Web Push API via service worker (we have sw.js) | MEDIUM |
| **SMS** | Fast2SMS alert (existing infra) | LOW — only if WhatsApp fails |
| **Email** | Future — needs email collection from sellers | LOW |

### What to Notify

| Event | Notify Seller? | Notify Customer? |
|-------|---------------|-----------------|
| New order placed | Yes (WhatsApp + dashboard) | Yes (WhatsApp confirmation) |
| Payment received | Yes (WhatsApp) | Yes (WhatsApp) |
| Order cancelled by customer | Yes (WhatsApp + SMS) | Yes (WhatsApp) |
| Low stock (< threshold) | Yes (dashboard banner) | No |
| New customer message | Yes (dashboard badge) | No |
| Monthly fee invoice | Yes (WhatsApp + dashboard) | No |

### Implementation Plan
- Phase 1-2: WhatsApp notification to seller on new order (use existing `sendWhatsAppMessage`)
- Phase 3: Add dashboard notification bell with unread count
- Phase 3+: Browser push notifications via service worker

---

## 5.7 STOCK MANAGEMENT ACROSS CHANNELS

### The Problem
When the same product is ordered from WhatsApp AND website simultaneously (and only 1 unit left), we risk overselling.

### Solution: Atomic Stock Decrement

Use Prisma's `$transaction` with conditional update:

```typescript
// Instead of: read stock → check → update (race condition)
// Do: atomic conditional update in one query

const updated = await prisma.product.updateMany({
  where: {
    id: productId,
    stockQuantity: { gte: requestedQuantity }  // Only if enough stock
  },
  data: {
    stockQuantity: { decrement: requestedQuantity }
  }
});

if (updated.count === 0) {
  throw new Error('Insufficient stock');
}
```

### Stock Decrement Points
| Channel | When to decrement | Implemented in |
|---------|-------------------|----------------|
| WhatsApp AI | When order is created (after address collected) | `commerce.ts` |
| Website storefront | When checkout is completed | checkout API |
| Offline billing | When bill is generated | billing API |
| Manual order (dashboard) | When order is created | orders API |

### Stock Restoration
- If order is cancelled → restore stock (increment)
- If payment fails/expires → restore stock after timeout
- If COD order is returned → restore stock manually

### Current Gap
The existing `createOrderFromWhatsApp` in `lib/whatsapp/order-service.ts` does NOT decrement stock. This must be fixed across ALL order creation paths.

---

## 6. DEVELOPMENT PHASES

### Phase 1: CSV/Excel Inventory Import
**Goal**: Remove the #1 objection — "I already have inventory in my POS"
**Priority**: HIGHEST
**Estimated Scope**: New upload UI + parser + validation + bulk insert
**Details**: See [phase1.md](./phase1.md)

### Phase 2: Cart System (WhatsApp + Website Shared)
**Goal**: Enable multi-product ordering via WhatsApp AI and prepare for storefront
**Priority**: HIGH
**Estimated Scope**: New Cart/CartItem tables + updated conversation flow
**Details**: See [phase2.md](./phase2.md)

### Phase 3: Seller Storefront (Online Store)
**Goal**: Give each seller a shareable online store link
**Priority**: HIGH
**Estimated Scope**: New public pages + cart UI + checkout flow
**Details**: See [phase3.md](./phase3.md)

### Phase 4: Screenshot & Smart Ordering
**Goal**: Let customers order by sending screenshots or links on WhatsApp
**Priority**: MEDIUM
**Estimated Scope**: Enhanced AI vision + URL parsing
**Details**: See [phase4.md](./phase4.md)

### Phase 5: Billing, Multi-Store & Instagram Import
**Goal**: Capture offline sellers + enterprise sellers + reduce data entry
**Priority**: MEDIUM-LOW
**Estimated Scope**: Invoice generator + multi-store schema + Instagram API
**Details**: See [phase5.md](./phase5.md)

---

## 7. DATABASE ARCHITECTURE DECISION

### Decision: Single Database, Multi-Tenant (CONFIRMED)

We will NOT create separate databases or tables per tenant. Instead:
- Single PostgreSQL database on Supabase
- All tables scoped by `tenantId`
- Proper indexes on `[tenantId, ...]` columns
- This approach handles 1000+ tenants with 100M+ rows

### Scaling Path (If Needed in Future)
| Scale | Action |
|-------|--------|
| 1 - 1,000 tenants | Current setup, no changes |
| 1,000 - 10,000 tenants | Add read replicas |
| 10,000 - 100,000 tenants | Table partitioning by tenantId |
| 100,000+ tenants | Database sharding |

---

## 8. TECH DECISIONS LOG

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Database per tenant | NO — single DB | Prisma doesn't support dynamic tables; simpler ops |
| Storefront approach | Built-in (not Shopify integration) | Full control, same DB, simpler for sellers |
| Cart architecture | Shared Cart table for WhatsApp + Website | Build once, use everywhere |
| Payment model | Free + 1% per order | Zero barrier to entry |
| Image ordering | OpenAI Vision (GPT-4o) | Already using OpenAI, supports image analysis |
| Storefront reference | ShopWa-style (simple, mobile-first) | Matches our target audience |
| 1% fee collection | Monthly invoice (start), split payment (later) | COD-heavy market, start simple |
| Stock management | Atomic decrement via Prisma $transaction | Prevent overselling across channels |
| Seller notifications | WhatsApp + dashboard + push | WhatsApp is primary channel for Indian sellers |

---

## 9. FILE STRUCTURE (Planned New Files)

```
sellvia/
├── app/
│   ├── store/[slug]/              # Phase 3: Public storefront
│   │   ├── page.tsx               # Store home (product grid)
│   │   ├── product/[id]/page.tsx  # Product detail
│   │   ├── cart/page.tsx          # Cart page
│   │   └── checkout/page.tsx      # Checkout page
│   ├── api/
│   │   ├── client/
│   │   │   ├── products/
│   │   │   │   └── import/route.ts    # Phase 1: CSV import API
│   │   │   ├── cart/route.ts          # Phase 2: Cart API
│   │   │   └── invoices/route.ts      # Phase 5: Invoice API
│   │   └── store/
│   │       ├── [slug]/route.ts        # Phase 3: Public store API
│   │       └── checkout/route.ts      # Phase 3: Checkout API
│   └── client/
│       ├── products/
│       │   └── import/page.tsx        # Phase 1: CSV import page
│       ├── billing/page.tsx           # Phase 5: Billing/Invoice
│       └── stores/page.tsx            # Phase 5: Multi-store management
├── components/
│   ├── import/                        # Phase 1: Import components
│   │   ├── csv-upload.tsx
│   │   ├── column-mapper.tsx
│   │   └── import-preview.tsx
│   ├── store/                         # Phase 3: Storefront components
│   │   ├── store-header.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-card.tsx
│   │   ├── cart-drawer.tsx
│   │   └── checkout-form.tsx
│   └── invoice/                       # Phase 5: Invoice components
│       ├── invoice-form.tsx
│       └── invoice-pdf.tsx
├── lib/
│   ├── import/                        # Phase 1: Import utilities
│   │   ├── csv-parser.ts
│   │   └── validators.ts
│   └── invoice/                       # Phase 5: Invoice utilities
│       └── pdf-generator.ts
└── prisma/
    └── schema.prisma                  # Updated with new models
```

---

## 10. SUMMARY

SatyaSell's path to becoming a one-stop commerce platform:

```
NOW (What we have):
  WhatsApp AI ordering (single product) + Dashboard + Payments

PHASE 1 (Next):
  + CSV Import → Sellers can onboard in minutes

PHASE 2:
  + Cart system → Multi-product ordering on WhatsApp

PHASE 3:
  + Storefront → Each seller gets a website

PHASE 4:
  + Screenshot ordering → Wow factor for WhatsApp

PHASE 5:
  + Billing + Multi-store + Instagram → Full one-stop platform
```

**End goal**: A seller signs up, imports inventory (or syncs from Instagram), and immediately has:
- An AI salesperson on WhatsApp taking orders 24/7
- A shareable online store website
- A billing tool for walk-in customers
- All from one dashboard, paying only 1% per order.

---

## DOCUMENT HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 27 Feb 2026 | 1.0 | Initial master plan based on seller demo feedback |
| 27 Feb 2026 | 1.1 | Added: 1% fee implementation, onboarding flow, notification system, stock management, fixed phase numbering |
