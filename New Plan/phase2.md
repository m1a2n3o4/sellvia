# Phase 2: Cart System (Shared — WhatsApp AI + Website)

## Priority: HIGH
## Status: Not Started
## Depends On: None (can start independently, but ideally after Phase 1)
## Goal: Enable multi-product ordering via WhatsApp AI and lay foundation for storefront

---

## 1. PROBLEM STATEMENT

Currently, our WhatsApp AI `ConversationState` stores only ONE product:
```
productId  → 1 product
variantId  → 1 variant
quantity   → 1 quantity
```

A customer wanting to order 3 different products must have 3 separate conversations. This is frustrating and unnatural.

Additionally, the upcoming storefront (Phase 3) will need a cart system. Building it now means we build it ONCE and share between WhatsApp AI + Website.

---

## 2. USER STORIES

### WhatsApp AI
1. **As a customer**, I want to add multiple products to my cart via WhatsApp before placing one order.
2. **As a customer**, I want to say "add red kurti and blue jeans" and have both added to my cart.
3. **As a customer**, I want to see my cart summary before confirming.
4. **As a customer**, I want to remove items from my cart via WhatsApp.
5. **As a customer**, I want my cart to persist for 1 hour even if I leave and come back.

### Website (Phase 3 - prepared here)
6. **As a customer**, I want to browse the store and add multiple products to cart.
7. **As a customer**, I want my cart saved even if I close the browser (for logged-in users).

---

## 3. DATABASE SCHEMA CHANGES

### New Tables

```prisma
model Cart {
  id             String     @id @default(uuid())
  tenantId       String     @map("tenant_id")
  customerPhone  String?    @map("customer_phone")    // WhatsApp customer
  sessionId      String?    @map("session_id")         // Website anonymous user
  status         CartStatus @default(active)
  expiresAt      DateTime?  @map("expires_at")          // Auto-expire after 1 hour (WhatsApp)
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")

  // Relations
  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@unique([tenantId, customerPhone])    // One active cart per customer per tenant
  @@unique([tenantId, sessionId])        // One active cart per session per tenant
  @@index([tenantId])
  @@index([expiresAt])
  @@map("carts")
}

enum CartStatus {
  active
  converted   // Converted to order
  expired
  abandoned
}

model CartItem {
  id          String   @id @default(uuid())
  cartId      String   @map("cart_id")
  productId   String   @map("product_id")
  variantId   String?  @map("variant_id")
  quantity    Int      @default(1)
  price       Decimal  @db.Decimal(10, 2)  // Price at time of adding
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  cart    Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@unique([cartId, productId, variantId])  // Prevent duplicate items
  @@index([cartId])
  @@map("cart_items")
}
```

### Modified Tables

```prisma
// Add relation to Tenant
model Tenant {
  // ... existing fields
  carts Cart[]    // NEW
}

// Add relation to Product
model Product {
  // ... existing fields
  cartItems CartItem[]  // NEW
}

// Add relation to ProductVariant
model ProductVariant {
  // ... existing fields
  cartItems CartItem[]  // NEW
}

// Update ConversationState — add cartId reference
model ConversationState {
  // ... existing fields
  cartId String? @map("cart_id")  // NEW — link to active cart
}
```

---

## 4. WHATSAPP AI FLOW CHANGES

### Current Flow (Single Product)
```
Customer: "I want red kurti"
AI: Shows product, asks quantity
Customer: "2"
AI: Asks address
Customer: "123 Main St..."
AI: Creates order (1 item)
```

### New Flow (Multi-Product Cart)
```
Customer: "I want red kurti"
AI: "Added Red Kurti (₹599) to your cart! 🛒

Your cart:
1. Red Kurti - ₹599 x 1 = ₹599

Total: ₹599

Want to add more items, or type 'checkout' to place your order."

Customer: "also add blue jeans"
AI: "Added Blue Jeans (₹899) to your cart! 🛒

Your cart:
1. Red Kurti - ₹599 x 1 = ₹599
2. Blue Jeans - ₹899 x 1 = ₹899

Total: ₹1,498

Want to add more items, or type 'checkout' to place your order."

Customer: "checkout"
AI: "Your order summary:

1. Red Kurti - ₹599 x 1 = ₹599
2. Blue Jeans - ₹899 x 1 = ₹899
Total: ₹1,498

Please share your delivery address to place the order."

Customer: "42 MG Road, Bangalore 560001"
AI: "Order Confirmed! 🎉

Order #ORD-1234
Items: Red Kurti x1, Blue Jeans x1
Total: ₹1,498
Delivery: 42 MG Road, Bangalore 560001

Payment link: [razorpay link]"
```

### New AI Actions to Add

```typescript
type CommerceAction =
  | 'none'
  | 'search_products'
  | 'initiate_order'        // CHANGED: now adds to cart instead of direct order
  | 'add_to_cart'           // NEW: add product to cart
  | 'remove_from_cart'      // NEW: remove product from cart
  | 'view_cart'             // NEW: show cart contents
  | 'checkout'              // NEW: proceed to checkout (ask address)
  | 'collect_address'
  | 'confirm_order'
  | 'track_order'
  | 'escalate_to_owner';
```

### Updated ConversationState Steps

```typescript
enum ConversationStep {
  idle
  product_shown
  awaiting_quantity
  shopping             // NEW: customer is browsing/adding items
  awaiting_address     // checkout started, need address
  awaiting_payment
  order_complete
}
```

---

## 5. TECHNICAL IMPLEMENTATION

### 5.1 New Files to Create

```
lib/cart/cart-service.ts           # Cart CRUD operations
app/api/client/cart/route.ts       # GET/POST cart (for dashboard view)
app/api/store/cart/route.ts        # Public cart API (for storefront - Phase 3)
```

### 5.2 Files to Modify

```
lib/whatsapp/ai.ts                 # Update system prompt with cart actions
lib/whatsapp/commerce.ts           # Add cart handling functions
prisma/schema.prisma               # Add Cart, CartItem models
```

### 5.3 Cart Service (`lib/cart/cart-service.ts`)

```typescript
// Core functions needed:

// Get or create cart for a WhatsApp customer
async function getOrCreateCart(tenantId: string, customerPhone: string): Promise<Cart>

// Add item to cart (upsert - if same product exists, update quantity)
async function addToCart(cartId: string, item: {
  productId: string;
  variantId?: string;
  quantity: number;
}): Promise<CartItem>

// Remove item from cart
async function removeFromCart(cartId: string, productId: string, variantId?: string): Promise<void>

// Update item quantity
async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem>

// Get cart with items and product details
async function getCartWithItems(cartId: string): Promise<CartWithItems>

// Clear cart (after order is placed)
async function clearCart(cartId: string): Promise<void>

// Convert cart to order
async function convertCartToOrder(cartId: string, deliveryAddress: string): Promise<Order>

// Expire old carts (cron job or on-access check)
async function expireOldCarts(): Promise<number>

// Format cart for WhatsApp message
function formatCartMessage(cart: CartWithItems): string
```

### 5.4 WhatsApp AI System Prompt Changes

Add to the AI system prompt:
```
CART SYSTEM:
- When a customer wants to buy a product, use "add_to_cart" to add it.
- After adding, show the updated cart summary and ask "Want to add more items, or type 'checkout' to place your order."
- When customer says "checkout", "place order", "done", "that's all", use "checkout" action.
- When customer says "remove [product]" or "cancel [product]", use "remove_from_cart".
- When customer says "show cart", "my cart", "what's in my cart", use "view_cart".
- ALWAYS show the cart summary after any cart change (add/remove).
- Cart format:
  1. Product Name - ₹Price x Qty = ₹Subtotal
  2. Product Name - ₹Price x Qty = ₹Subtotal
  Total: ₹Total
```

### 5.5 Updated Commerce Flow (`lib/whatsapp/commerce.ts`)

```typescript
// New handler functions:

async function handleAddToCart(ctx: CommerceContext) {
  // 1. Get or create cart for customer
  // 2. Find product by ID or name
  // 3. Add to cart (upsert if exists)
  // 4. Send cart summary via WhatsApp
  // 5. Update conversation state to 'shopping'
}

async function handleRemoveFromCart(ctx: CommerceContext) {
  // 1. Get cart
  // 2. Remove item
  // 3. Send updated cart summary
  // 4. If cart empty, reset to idle
}

async function handleViewCart(ctx: CommerceContext) {
  // 1. Get cart with items
  // 2. Format and send summary
}

async function handleCheckout(ctx: CommerceContext) {
  // 1. Get cart — verify not empty
  // 2. Show final order summary
  // 3. Ask for delivery address
  // 4. Update state to 'awaiting_address'
}

// Modify existing handleAddressReceived:
async function handleAddressReceived(ctx: CommerceContext) {
  // UPDATED: Create order from CART (multiple items) instead of single product
  // 1. Get cart items
  // 2. Create order with all cart items
  // 3. Generate payment link for total amount
  // 4. Send confirmation
  // 5. Clear cart, reset state
}
```

---

## 6. CART LIMITS & STOCK VALIDATION

### Cart Item Limit
- **Maximum items per cart**: 20
- If customer tries to add 21st item → "Your cart is full (max 20 items). Please remove an item or proceed to checkout."
- **Maximum quantity per item**: 99
- These limits apply to both WhatsApp and website carts

### Stock Validation — Two Checkpoints

**Checkpoint 1: At "Add to Cart" time**
- Check if product is in stock (`stockQuantity > 0`)
- Check if requested quantity is available
- If out of stock → "Sorry, [Product Name] is currently out of stock"
- If not enough stock → "Sorry, only X units of [Product Name] are available"

**Checkpoint 2: At Checkout time (CRITICAL)**
Stock can change between "add to cart" and "checkout" (minutes/hours later).
Must re-validate ALL cart items at checkout:

```typescript
async function validateCartStock(cartId: string): Promise<StockValidationResult> {
  const cart = await getCartWithItems(cartId);
  const issues: StockIssue[] = [];

  for (const item of cart.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product || product.status !== 'active') {
      issues.push({
        itemId: item.id,
        type: 'unavailable',
        message: `${item.product.name} is no longer available`
      });
    } else if (product.stockQuantity < item.quantity) {
      issues.push({
        itemId: item.id,
        type: 'insufficient',
        message: `Only ${product.stockQuantity} units of ${product.name} available (you have ${item.quantity} in cart)`,
        availableQty: product.stockQuantity
      });
    }
  }

  return { valid: issues.length === 0, issues };
}
```

**If stock issues found at checkout:**
- WhatsApp: AI tells customer "Some items in your cart are no longer available: [list]. Want to proceed with the remaining items?"
- Website: Show warning on cart page with option to update quantities or remove items

### Atomic Stock Decrement at Order Creation
Use Prisma `$transaction` to prevent overselling:

```typescript
await prisma.$transaction(async (tx) => {
  // Decrement stock for ALL items atomically
  for (const item of cartItems) {
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
      throw new Error(`Insufficient stock for ${item.productName}`);
    }
  }

  // Create order only if ALL stock decrements succeeded
  const order = await tx.order.create({ ... });
  return order;
});
```

---

## 7. BACKWARD COMPATIBILITY

The new cart system must be backward compatible with existing single-product flow:

- If customer says "I want red kurti" → add to cart (1 item) + show cart
- If customer immediately says "checkout" → same as old flow (just faster)
- Old `ConversationState` fields (`productId`, `quantity`) still used for backward compat during transition
- Cart expiry (1 hour) prevents stale carts from accumulating

---

## 8. DATABASE MIGRATION PLAN

### Adding New Tables
```bash
# Generate migration for Cart + CartItem tables
npx prisma migrate dev --name add_cart_system
```

This is safe — adding new tables doesn't affect existing data.

### Updating ConversationState
Adding `cartId` field to existing ConversationState:
```bash
npx prisma migrate dev --name add_cart_id_to_conversation_state
```
- New column `cart_id` is nullable → no impact on existing records
- Existing conversations continue to work with old `productId`/`quantity` fields

### Transition Strategy
1. **Deploy Phase 2 code** with both old and new flows
2. **Old flow still works**: If no cart exists, fall back to `ConversationState.productId/quantity`
3. **New conversations** use cart system
4. **After 1 week**: All active conversations will have expired (15-min timeout)
5. **Cleanup**: Can remove old `productId`/`quantity` from ConversationState (optional, low priority)

### Rollback Plan
If cart system has bugs:
- Cart tables can be dropped without affecting existing functionality
- Old ConversationState flow continues to work
- Feature flag: `ENABLE_CART_SYSTEM=true/false` in env vars to toggle

---

## 7. CART EXPIRY & CLEANUP

### WhatsApp Carts
- **Expiry**: 1 hour after last update
- **Check**: On every cart access, check if expired
- **Cleanup**: Cron job or Vercel cron to clear expired carts daily

### Website Carts (Phase 3)
- **Anonymous users**: 24 hours (stored via sessionId cookie)
- **Logged-in users**: 7 days

---

## 9. UI/UX FOR DASHBOARD (Optional Enhancement)

### Cart Analytics (Client Dashboard)
Show sellers abandoned cart stats:
```
┌──────────────────────────────────┐
│  Cart Analytics (Last 30 days)   │
│                                  │
│  🛒 Total Carts: 156            │
│  ✅ Converted: 89 (57%)         │
│  ❌ Abandoned: 52 (33%)         │
│  ⏰ Expired: 15 (10%)           │
│                                  │
│  Avg Cart Value: ₹1,247         │
│  Avg Items/Cart: 2.3            │
└──────────────────────────────────┘
```

This is optional for Phase 2 — can be added later.

---

## 10. TESTING REQUIREMENTS

### Unit Tests
- Cart CRUD operations (create, add item, remove item, update quantity)
- Cart expiry logic
- Cart to order conversion
- Duplicate item handling (same product added twice = quantity update)
- Cart message formatting

### Integration Tests
- Full WhatsApp flow: add 3 items → view cart → remove 1 → checkout → address → order created
- Cart persists across multiple messages
- Cart expiry after 1 hour
- Concurrent cart access (two messages at same time)
- Payment link generated for total cart amount

### Edge Cases
- Empty cart checkout attempt → "Your cart is empty"
- Product goes out of stock after adding to cart → warn at checkout
- Price changes after adding to cart → use price at time of adding
- Customer adds same product twice → increase quantity
- Cart with 20+ items → still works (but warn "large order")

---

## 11. ACCEPTANCE CRITERIA

- [ ] Customer can add multiple products to cart via WhatsApp
- [ ] Cart summary is shown after every add/remove
- [ ] Customer can say "checkout" to proceed with all items
- [ ] Order is created with all cart items (multiple OrderItems)
- [ ] Payment link amount = total of all cart items
- [ ] Cart expires after 1 hour of inactivity
- [ ] Backward compatible — single product ordering still works
- [ ] Cart model supports both WhatsApp (customerPhone) and website (sessionId)
- [ ] Cart analytics visible in dashboard (optional)
- [ ] Cart has max 20 items limit enforced
- [ ] Stock re-validated at checkout time (not just add-to-cart time)
- [ ] Atomic stock decrement prevents overselling
- [ ] If product goes out of stock after adding to cart → warning shown at checkout
- [ ] Database migration runs cleanly without affecting existing data
- [ ] Rollback possible via feature flag

---

## 12. MODIFIED FILES SUMMARY

### New files:
1. `lib/cart/cart-service.ts`
2. `app/api/client/cart/route.ts` (optional - dashboard view)

### Modified files:
1. `prisma/schema.prisma` — Add Cart, CartItem, CartStatus, update relations
2. `lib/whatsapp/ai.ts` — Update system prompt with cart actions
3. `lib/whatsapp/commerce.ts` — Add cart handlers, modify order creation
4. `lib/whatsapp/order-service.ts` — Support multi-item order from cart
