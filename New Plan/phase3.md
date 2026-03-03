# Phase 3: Seller Storefront (Online Store)

## Priority: HIGH
## Status: Not Started
## Depends On: Phase 2 (Cart System)
## Goal: Give each seller a shareable online store link for multi-product browsing & ordering

---

## 1. PROBLEM STATEMENT

WhatsApp AI is great for quick, single-product orders. But when customers want to:
- Browse all products
- Compare items
- Add multiple products to cart
- See product images in detail

They need a visual storefront. Currently, sellers have no online store — they lose these customers.

---

## 2. USER STORIES

### Customer (Buyer)
1. **As a customer**, I want to open a store link and browse all products.
2. **As a customer**, I want to filter products by category.
3. **As a customer**, I want to search for products by name.
4. **As a customer**, I want to see product details (images, price, description, variants).
5. **As a customer**, I want to add multiple products to my cart.
6. **As a customer**, I want to checkout with my name, phone, address.
7. **As a customer**, I want to pay via UPI/COD.
8. **As a customer**, I want to contact the seller via WhatsApp for questions.
9. **As a customer**, I want the store to load fast on my mobile phone.

### Seller (Store Owner)
10. **As a seller**, I want a unique store link I can share on Instagram, WhatsApp, and social media.
11. **As a seller**, I want my store to show my brand name and logo.
12. **As a seller**, I want orders from the storefront to appear in my existing dashboard.
13. **As a seller**, I want to customize my store's basic appearance (logo, colors).
14. **As a seller**, I want to enable/disable the storefront from my settings.

---

## 3. URL STRUCTURE

```
Public storefront:    satyasell.com/store/{slug}
Product detail:       satyasell.com/store/{slug}/product/{productId}
Cart:                 satyasell.com/store/{slug}/cart
Checkout:             satyasell.com/store/{slug}/checkout
Order confirmation:   satyasell.com/store/{slug}/order/{orderId}

Future (custom domain): brandzbazar.com → proxied to satyasell.com/store/brandz-bazar
```

---

## 4. UI/UX DESIGN

### 4.1 Store Home Page (`/store/{slug}`)

```
┌──────────────────────────────────────────┐
│  ┌──┐  Brandz Bazar            🛒 (2)   │  ← Header: logo + name + cart
│  └──┘                                    │
├──────────────────────────────────────────┤
│  🔍 Search products...                   │  ← Search bar
├──────────────────────────────────────────┤
│  [All] [Women] [Men] [Accessories] [→]   │  ← Category tabs (horizontal scroll)
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────┐  ┌────────────┐          │
│  │   📷       │  │   📷       │          │
│  │            │  │            │          │  ← 2-column product grid
│  │ Red Kurti  │  │ Blue Jeans │          │
│  │ ₹599      │  │ ₹899      │          │
│  │ [Add 🛒]  │  │ [Add 🛒]  │          │
│  └────────────┘  └────────────┘          │
│                                          │
│  ┌────────────┐  ┌────────────┐          │
│  │   📷       │  │   📷       │          │
│  │            │  │            │          │
│  │ Watch      │  │ Sneakers   │          │
│  │ ₹1,299    │  │ ₹2,499    │          │
│  │ [Add 🛒]  │  │ [Add 🛒]  │          │
│  └────────────┘  └────────────┘          │
│                                          │
│  [ Load More Products ]                  │  ← Pagination / infinite scroll
│                                          │
├──────────────────────────────────────────┤
│  💬 Chat on WhatsApp                     │  ← Floating WhatsApp button
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │  🛒 View Cart (2 items) - ₹1,498│    │  ← Sticky bottom cart bar
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### 4.2 Product Detail Page (`/store/{slug}/product/{id}`)

```
┌──────────────────────────────────────────┐
│  ← Back          Brandz Bazar    🛒 (2)  │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │        Product Image             │    │  ← Main image (swipeable gallery)
│  │        (full width)              │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│  [ 📷 ] [ 📷 ] [ 📷 ] [ 📷 ]           │  ← Thumbnail gallery
│                                          │
│  Red Cotton Kurti                        │  ← Product name
│  FabIndia                                │  ← Brand
│  ₹599                                   │  ← Price
│  ✅ In Stock (50 available)              │  ← Stock status
│                                          │
│  Size:  [S] [M] [L] [XL]                │  ← Variants (if any)
│  Color: [Red] [Blue] [Green]             │
│                                          │
│  ── Description ──                       │
│  Beautiful red cotton kurti with          │
│  traditional embroidery work. Perfect    │
│  for casual and festive occasions.       │
│                                          │
│  Quantity: [ - ] 1 [ + ]                │  ← Quantity selector
│                                          │
│  ┌──────────────────────────────────┐    │
│  │      Add to Cart - ₹599         │    │  ← Primary CTA button
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │      💬 Ask on WhatsApp          │    │  ← Secondary CTA
│  └──────────────────────────────────┘    │
│                                          │
│  ── You May Also Like ──                 │  ← Related products
│  [📷 Product] [📷 Product] [📷 Product]  │
└──────────────────────────────────────────┘
```

### 4.3 Cart Page (`/store/{slug}/cart`)

```
┌──────────────────────────────────────────┐
│  ← Back to Store     Your Cart   🛒 (2) │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 📷  Red Cotton Kurti             │    │
│  │     Size: M | Color: Red         │    │
│  │     ₹599                        │    │
│  │     [ - ] 1 [ + ]     🗑️ Remove │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 📷  Blue Slim Jeans              │    │
│  │     Size: 32                     │    │
│  │     ₹899                        │    │
│  │     [ - ] 1 [ + ]     🗑️ Remove │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ─────────────────────────────────────── │
│  Subtotal:                      ₹1,498  │
│  Delivery:                      ₹0      │  ← Free or configured
│  ─────────────────────────────────────── │
│  Total:                         ₹1,498  │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │    Proceed to Checkout - ₹1,498  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [ Continue Shopping ]                   │
└──────────────────────────────────────────┘
```

### 4.4 Checkout Page (`/store/{slug}/checkout`)

```
┌──────────────────────────────────────────┐
│  ← Back              Checkout            │
├──────────────────────────────────────────┤
│                                          │
│  CONTACT DETAILS                         │
│  ┌──────────────────────────────────┐    │
│  │ Full Name *                      │    │
│  │ [_____________________________]  │    │
│  │                                  │    │
│  │ Phone Number *                   │    │
│  │ [+91 ________________________]   │    │
│  │                                  │    │
│  │ Email (optional)                 │    │
│  │ [_____________________________]  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  DELIVERY ADDRESS                        │
│  ┌──────────────────────────────────┐    │
│  │ Full Address *                   │    │
│  │ [_____________________________]  │    │
│  │ [_____________________________]  │    │
│  │                                  │    │
│  │ City *           State *         │    │
│  │ [____________]   [____________]  │    │
│  │                                  │    │
│  │ Pincode *                        │    │
│  │ [____________]                   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  PAYMENT METHOD                          │
│  ┌──────────────────────────────────┐    │
│  │ ○ Pay Online (UPI/Card/Wallet)   │    │
│  │ ○ Cash on Delivery (COD)         │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ORDER SUMMARY                           │
│  ┌──────────────────────────────────┐    │
│  │ Red Cotton Kurti x1      ₹599   │    │
│  │ Blue Slim Jeans x1       ₹899   │    │
│  │ ──────────────────────────────── │    │
│  │ Subtotal                ₹1,498  │    │
│  │ Delivery                    ₹0  │    │
│  │ Total                   ₹1,498  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │      Place Order - ₹1,498       │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### 4.5 Order Confirmation Page (`/store/{slug}/order/{orderId}`)

```
┌──────────────────────────────────────────┐
│                                          │
│          ✅ Order Placed!                │
│                                          │
│  Order #ORD-2026-0042                    │
│                                          │
│  Red Cotton Kurti x1          ₹599      │
│  Blue Slim Jeans x1           ₹899      │
│  ─────────────────────────────────────── │
│  Total: ₹1,498                          │
│  Payment: Cash on Delivery              │
│  Delivery to: 42 MG Road, Bangalore     │
│                                          │
│  You will receive order updates on       │
│  WhatsApp at +91-98765-43210             │
│                                          │
│  [💬 Track on WhatsApp]                  │
│  [🛒 Continue Shopping]                  │
│                                          │
│  Powered by SatyaSell                    │
└──────────────────────────────────────────┘
```

---

## 5. DATABASE SCHEMA CHANGES

### New Fields on BusinessInfo

```prisma
model BusinessInfo {
  // ... existing fields

  // NEW - Storefront settings
  storeSlug         String?  @unique @map("store_slug")       // URL slug: satyasell.com/store/{slug}
  storeEnabled      Boolean  @default(false) @map("store_enabled")
  storeLogo         String?  @map("store_logo")               // Logo image URL
  storeBanner       String?  @map("store_banner")             // Banner image URL
  storeThemeColor   String?  @default("#2563eb") @map("store_theme_color") // Primary color
  storeDescription  String?  @map("store_description")        // Store bio for storefront
  deliveryFee       Decimal  @default(0) @map("delivery_fee") @db.Decimal(10, 2)
  minOrderAmount    Decimal  @default(0) @map("min_order_amount") @db.Decimal(10, 2)
  codEnabled        Boolean  @default(true) @map("cod_enabled")
  onlinePayEnabled  Boolean  @default(true) @map("online_pay_enabled")
}
```

### Update OrderType Enum

```prisma
enum OrderType {
  online      // Existing - from dashboard
  offline     // Existing - walk-in
  whatsapp    // NEW - from WhatsApp AI
  website     // NEW - from storefront
}
```

---

## 6. TECHNICAL IMPLEMENTATION

### 6.1 New Files to Create

```
# Public storefront pages (NO AUTH - public)
app/store/[slug]/page.tsx                    # Store home
app/store/[slug]/product/[id]/page.tsx       # Product detail
app/store/[slug]/cart/page.tsx               # Cart
app/store/[slug]/checkout/page.tsx           # Checkout
app/store/[slug]/order/[orderId]/page.tsx    # Order confirmation
app/store/[slug]/layout.tsx                  # Store layout (header, footer)

# Public store APIs (NO AUTH)
app/api/store/[slug]/route.ts               # GET: Store info + categories
app/api/store/[slug]/products/route.ts      # GET: Product listing (paginated)
app/api/store/[slug]/product/[id]/route.ts  # GET: Product detail
app/api/store/[slug]/cart/route.ts          # GET/POST/DELETE: Cart operations
app/api/store/[slug]/checkout/route.ts      # POST: Place order
app/api/store/[slug]/order/[id]/route.ts    # GET: Order status

# Storefront components
components/store/store-header.tsx            # Header with logo, search, cart
components/store/product-grid.tsx            # 2-column responsive grid
components/store/product-card.tsx            # Single product card
components/store/category-tabs.tsx           # Category filter tabs
components/store/search-bar.tsx              # Product search
components/store/product-gallery.tsx         # Image gallery with swipe
components/store/variant-selector.tsx        # Size/color picker
components/store/quantity-selector.tsx       # +/- quantity input
components/store/cart-drawer.tsx             # Slide-in cart panel (optional)
components/store/cart-item.tsx               # Cart item row
components/store/checkout-form.tsx           # Checkout form
components/store/order-summary.tsx           # Order summary card
components/store/floating-whatsapp.tsx       # WhatsApp chat button
components/store/store-footer.tsx            # Footer with SatyaSell branding

# Store settings (seller dashboard)
app/client/settings/store/page.tsx           # Store customization settings
```

### 6.2 Files to Modify

```
prisma/schema.prisma                         # Add store fields to BusinessInfo
middleware.ts                                # Ensure /store/* routes are PUBLIC
app/client/settings/page.tsx                 # Add "Storefront" tab/link
```

### 6.3 Middleware Update

```typescript
// middleware.ts — add /store/* to public routes
// Store pages should be publicly accessible (no auth)
if (pathname.startsWith('/store/')) {
  return NextResponse.next();
}
```

### 6.4 API Design

#### GET `/api/store/{slug}`
Returns store info:
```json
{
  "storeName": "Brandz Bazar",
  "storeSlug": "brandz-bazar",
  "storeLogo": "https://...",
  "storeBanner": "https://...",
  "storeThemeColor": "#2563eb",
  "storeDescription": "Best clothing in Hyderabad",
  "categories": ["Women", "Men", "Accessories", "Footwear"],
  "deliveryFee": 0,
  "minOrderAmount": 299,
  "codEnabled": true,
  "onlinePayEnabled": true,
  "whatsappNumber": "919876543210"
}
```

#### GET `/api/store/{slug}/products?category=Women&search=kurti&page=1&limit=20`
Returns paginated products:
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Red Cotton Kurti",
      "brand": "FabIndia",
      "basePrice": 599,
      "images": ["https://..."],
      "category": "Women",
      "stockQuantity": 50,
      "variants": [
        { "id": "uuid", "variantName": "Size M", "price": 599, "stockQuantity": 20 }
      ]
    }
  ],
  "total": 156,
  "page": 1,
  "totalPages": 8
}
```

#### POST `/api/store/{slug}/checkout`
Places order:
```json
// Request
{
  "cartId": "uuid",
  "customerName": "Priya Sharma",
  "customerPhone": "9876543210",
  "customerEmail": "priya@email.com",
  "deliveryAddress": "42 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "paymentMethod": "cod"
}

// Response
{
  "orderId": "uuid",
  "orderNumber": "ORD-2026-0042",
  "total": 1498,
  "paymentMethod": "cod",
  "paymentLink": null,
  "status": "confirmed"
}
```

---

## 7. SECURITY & RATE LIMITING

### Rate Limiting on Public APIs
Store APIs are public (no auth). Without protection, bots can:
- Scrape all product data
- Spam the checkout API with fake orders
- DDoS the store pages

### Implementation

#### Option A: Vercel Edge Middleware Rate Limiting (Recommended)
```typescript
// middleware.ts — add rate limiting for /api/store/* routes
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute per IP
});

// For /api/store/*/checkout — stricter limit
const checkoutRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 checkout attempts per minute
});
```

#### Option B: Simple In-Memory Rate Limiting (No extra dependency)
```typescript
// Simple Map-based rate limiter (works on Vercel but resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

**Recommendation**: Start with Option B (no extra dependency). Move to Option A (Upstash Redis) if abuse becomes a problem.

#### Rate Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /api/store/[slug]` | 60/min per IP | Product browsing |
| `GET /api/store/[slug]/products` | 60/min per IP | Product listing |
| `POST /api/store/[slug]/cart` | 30/min per IP | Cart operations |
| `POST /api/store/[slug]/checkout` | 5/min per IP | Order placement |

### CSRF Protection on Checkout
- Generate a CSRF token when cart page loads
- Include in checkout form as hidden field
- Validate on server before processing order

### Bot Protection on Checkout
- Add honeypot field (hidden field that bots fill but humans don't)
- If honeypot is filled → reject silently
- Consider adding simple captcha (Google reCAPTCHA v3) if spam orders become an issue

---

## 8. ERROR & EMPTY STATES

### Store Not Found (404)
When slug doesn't exist:
```
┌──────────────────────────────────────────┐
│                                          │
│          🏪 Store Not Found              │
│                                          │
│  The store you're looking for doesn't    │
│  exist or may have been removed.         │
│                                          │
│  [🏠 Go to SatyaSell Home]              │
│                                          │
│  Are you a seller?                       │
│  Create your own free store at           │
│  satyasell.com/get-started               │
│                                          │
└──────────────────────────────────────────┘
```

### Store Disabled
When seller has `storeEnabled = false`:
```
┌──────────────────────────────────────────┐
│                                          │
│  ┌──┐  Brandz Bazar                     │
│  └──┘                                    │
│                                          │
│  This store is temporarily unavailable.  │
│                                          │
│  💬 Contact on WhatsApp                  │
│                                          │
└──────────────────────────────────────────┘
```

### Empty Store (No Products)
When store is enabled but has 0 active products:
```
┌──────────────────────────────────────────┐
│  ┌──┐  Brandz Bazar            🛒 (0)   │
├──────────────────────────────────────────┤
│                                          │
│          🛍️ Coming Soon!                │
│                                          │
│  We're adding products to our store.     │
│  Check back soon!                        │
│                                          │
│  💬 Chat with us on WhatsApp             │
│                                          │
└──────────────────────────────────────────┘
```

### Out of Stock Product
On product detail page when `stockQuantity = 0`:
- "Add to Cart" button → disabled, text changes to "Out of Stock"
- Show: "Notify me when available" (optional — saves customer phone for notification)
- On product grid: show greyed-out card with "Out of Stock" label

### Empty Cart
```
┌──────────────────────────────────────────┐
│  ← Back to Store     Your Cart   🛒 (0) │
├──────────────────────────────────────────┤
│                                          │
│          🛒 Your cart is empty           │
│                                          │
│  Browse our products and add items       │
│  you love!                               │
│                                          │
│  [🛍️ Start Shopping]                    │
│                                          │
└──────────────────────────────────────────┘
```

---

## 9. PRODUCT SHARING

### Share Button on Product Detail Page
```
┌──────────────────────────────────────────┐
│  [📤 Share]                              │
│  ┌──────────────────────────────────┐    │
│  │ 💬 Share on WhatsApp             │    │
│  │ 📋 Copy Link                     │    │
│  │ 📱 Share to Instagram Story      │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**WhatsApp Share**: Opens `https://wa.me/?text=Check out Red Cotton Kurti (₹599) at Brandz Bazar! https://satyasell.com/store/brandz-bazar/product/abc123`

**Copy Link**: Copies product URL to clipboard with toast "Link copied!"

**Instagram Story**: Uses Web Share API (`navigator.share()`) on supported browsers

### Share Button on Store Home
"Share this store" button in header → same options but shares store URL

---

## 10. STOCK MANAGEMENT

### Stock Decrement at Checkout
When an order is placed via the storefront, stock MUST be decremented atomically:

```typescript
// In checkout API handler
await prisma.$transaction(async (tx) => {
  const cart = await tx.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } }
  });

  // Re-validate stock for ALL items
  for (const item of cart.items) {
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stockQuantity: { gte: item.quantity }
      },
      data: {
        stockQuantity: { decrement: item.quantity }
      }
    });

    if (updated.count === 0) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }
  }

  // Create order with all items
  const order = await tx.order.create({
    data: {
      tenantId,
      orderNumber: generateOrderNumber(),
      customerId: customer.id,
      orderType: 'website',
      subtotal: cart.subtotal,
      total: cart.total + deliveryFee,
      deliveryAddress: address,
      // ... other fields
      orderItems: {
        create: cart.items.map(item => ({
          tenantId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        }))
      }
    }
  });

  // Mark cart as converted
  await tx.cart.update({
    where: { id: cartId },
    data: { status: 'converted' }
  });

  return order;
});
```

### Stock Restoration on Cancellation
If order is cancelled → restore stock:
```typescript
for (const item of order.orderItems) {
  await prisma.product.update({
    where: { id: item.productId },
    data: { stockQuantity: { increment: item.quantity } }
  });
}
```

---

## 11. STOREFRONT ANALYTICS

### What to Track (Per Store)
| Metric | How | Storage |
|--------|-----|---------|
| Page views | Reuse existing `PageView` model | `page_views` table |
| Product views | Track in `PageView` with `page = /store/slug/product/id` | `page_views` table |
| Add-to-cart events | Log in a new `StoreEvent` model | `store_events` table |
| Checkout started | StoreEvent with type = 'checkout_started' | `store_events` table |
| Order completed | Already tracked in `orders` table | `orders` table |
| Conversion rate | Calculated: orders / page views | Dashboard computed |

### New Model (Optional)
```prisma
model StoreEvent {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  event     String   // 'page_view', 'product_view', 'add_to_cart', 'checkout_started'
  productId String?  @map("product_id")
  sessionId String?  @map("session_id")
  metadata  Json?    // extra data (device, referrer, etc.)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([tenantId])
  @@index([tenantId, event])
  @@index([tenantId, createdAt])
  @@map("store_events")
}
```

### Seller Dashboard — Store Analytics Section
```
┌──────────────────────────────────────────┐
│  Store Analytics (Last 30 days)          │
├──────────────────────────────────────────┤
│                                          │
│  👁️ Store Views:     1,245              │
│  🛒 Add to Cart:       312 (25%)        │
│  💰 Orders:             89 (7.1%)       │
│  📈 Revenue:        ₹52,000             │
│                                          │
│  Top Products (by views):               │
│  1. Red Cotton Kurti - 245 views        │
│  2. Blue Slim Jeans - 189 views         │
│  3. Watch Classic - 156 views           │
│                                          │
│  Traffic Source:                         │
│  WhatsApp: 45%  |  Instagram: 30%       │
│  Direct: 15%    |  Other: 10%           │
└──────────────────────────────────────────┘
```

---

## 12. CHECKOUT VALIDATION

### Zod Schema for Checkout Form
```typescript
import { z } from 'zod';

export const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  customerPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  customerEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  deliveryAddress: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address is too long'),
  city: z.string()
    .min(2, 'Enter a valid city name')
    .max(100),
  state: z.string()
    .min(2, 'Enter a valid state name')
    .max(100),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  paymentMethod: z.enum(['cod', 'online']),
});
```

### Server-Side Validation
- Validate with Zod schema before processing
- Verify cart belongs to this store (tenant)
- Verify cart is not expired or already converted
- Re-validate stock (see Stock Management section above)
- Check minimum order amount (if configured by seller)

---

## 13. SEO & PERFORMANCE

### SEO
- Each store page should have proper meta tags (title, description, og:image)
- Product pages should have structured data (JSON-LD) for Google Shopping
- Store slug should be URL-friendly (lowercase, hyphens)
- Generate `sitemap.xml` for each active store

### Performance
- Use Next.js **Server Components** for initial page load (SSR)
- **Image optimization**: Use Next.js `<Image>` with Supabase CDN
- **Pagination**: Load 20 products at a time
- **Cache**: Cache store info and product listings (revalidate every 5 minutes)
- Target: **< 3 second** load on 3G mobile

---

## 14. STOREFRONT SETTINGS (Seller Dashboard)

Add a new settings page for sellers to customize their store:

```
┌──────────────────────────────────────────┐
│  Storefront Settings                     │
├──────────────────────────────────────────┤
│                                          │
│  Store Status: [🟢 Enabled / 🔴 Off]    │
│                                          │
│  Store URL:                              │
│  satyasell.com/store/[brandz-bazar]      │
│  📋 Copy Link    📤 Share                │
│                                          │
│  Store Name: [Brandz Bazar____________]  │
│  Store Bio:  [Best clothing in HYD____]  │
│                                          │
│  Store Logo:  [📤 Upload]                │
│  Banner:      [📤 Upload]                │
│  Theme Color: [🎨 #2563eb]              │
│                                          │
│  DELIVERY SETTINGS                       │
│  Delivery Fee:    [₹ 0____________]      │
│  Min Order Amount:[₹ 299__________]      │
│                                          │
│  PAYMENT OPTIONS                         │
│  ☑ Cash on Delivery                      │
│  ☑ Online Payment (UPI/Card)             │
│                                          │
│  [Save Changes]                          │
└──────────────────────────────────────────┘
```

---

## 15. WHATSAPP INTEGRATION

The storefront should deeply integrate with WhatsApp:

1. **Floating WhatsApp button** on every store page
   - Opens: `https://wa.me/919876543210?text=Hi, I'm browsing your store`
2. **"Ask on WhatsApp" button** on product detail page
   - Opens: `https://wa.me/919876543210?text=Hi, I'm interested in Red Cotton Kurti (₹599)`
3. **Order confirmation sent via WhatsApp**
   - After checkout, send order summary to customer's WhatsApp
   - Reuse existing `sendWhatsAppMessage` function
4. **Order updates via WhatsApp**
   - Status changes (confirmed, shipped, delivered) sent as WhatsApp messages

---

## 16. TESTING REQUIREMENTS

### Unit Tests
- Store slug validation (no special chars, unique)
- Product listing with filters (category, search, pagination)
- Cart operations via API
- Checkout validation (required fields, phone format, pincode)
- Order creation from storefront

### Integration Tests
- Full flow: browse → add to cart → checkout → order created → appears in dashboard
- Payment flow: online payment → redirect → order confirmed
- WhatsApp notification sent after order
- Stock decremented after order
- Out-of-stock product handling

### Performance Tests
- Store page loads under 3 seconds on 3G
- Product grid renders 20 items smoothly
- Image lazy loading works correctly

### Mobile Tests
- All pages work on 360px width (minimum Android)
- Touch gestures: swipe product images, scroll product grid
- Form inputs: mobile keyboard appropriate types (tel, email)

---

## 17. ACCEPTANCE CRITERIA

- [ ] Each seller gets a unique store URL (satyasell.com/store/{slug})
- [ ] Store home shows products in 2-column grid
- [ ] Products filterable by category
- [ ] Products searchable by name
- [ ] Product detail page shows images, price, variants, description
- [ ] Cart functionality: add, remove, update quantity
- [ ] Checkout with name, phone, address, payment method
- [ ] Orders appear in seller's dashboard
- [ ] Order type marked as "website"
- [ ] WhatsApp button on every page
- [ ] Order confirmation sent via WhatsApp to customer
- [ ] Seller can customize: logo, banner, theme color, slug
- [ ] Seller can enable/disable storefront
- [ ] Store is mobile-responsive (works on 360px+)
- [ ] Page loads under 3 seconds on mobile
- [ ] "Powered by SatyaSell" in footer
- [ ] Rate limiting on all public APIs (60 req/min browse, 5 req/min checkout)
- [ ] Store not found → friendly 404 page
- [ ] Store disabled → "temporarily unavailable" page
- [ ] Empty store → "coming soon" page
- [ ] Out-of-stock products shown but disabled
- [ ] Product sharing (WhatsApp, copy link)
- [ ] Stock atomically decremented on order placement
- [ ] Stock restored on order cancellation
- [ ] Checkout form validated with Zod (phone, pincode, address)
- [ ] Storefront analytics visible in seller dashboard
- [ ] Honeypot field on checkout for bot protection

---

## 18. MODIFIED FILES SUMMARY

### New files: ~25 files
(Listed in section 6.1 above)

### Additional new files for security, analytics, validation:
- `lib/store/rate-limiter.ts` — Rate limiting utility
- `lib/validations/checkout.ts` — Zod checkout schema
- `app/store/[slug]/not-found.tsx` — Store 404 page
- `components/store/empty-state.tsx` — Empty store / out of stock components
- `components/store/share-button.tsx` — Product/store sharing
- `app/api/store/[slug]/events/route.ts` — Store event tracking API

### Modified files:
1. `prisma/schema.prisma` — Store fields on BusinessInfo, OrderType enum, StoreEvent model
2. `middleware.ts` — Allow /store/* public access + rate limiting
3. `app/client/settings/page.tsx` — Add storefront settings link
4. `lib/whatsapp/order-service.ts` — Support website order type + stock decrement
5. `app/client/page.tsx` — Add store analytics section to dashboard
