import { prisma } from '@/lib/db/prisma';

const CART_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MAX_CART_ITEMS = 20;
const MAX_ITEM_QUANTITY = 99;

interface AddToCartInput {
  tenantId: string;
  chatId: string;
  customerPhone: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
}

// ─── Get or Create Cart ─────────────────────────────────────

export async function getOrCreateCart(tenantId: string, chatId: string, customerPhone: string) {
  // Find active cart for this chat
  let cart = await prisma.cart.findFirst({
    where: { chatId, status: 'active' },
  });

  // Check expiry
  if (cart && cart.expiresAt < new Date()) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'expired' },
    });
    cart = null;
  }

  // Create new cart if needed
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        tenantId,
        chatId,
        customerPhone,
        status: 'active',
        expiresAt: new Date(Date.now() + CART_EXPIRY_MS),
      },
    });
  }

  return cart;
}

// ─── Get Active Cart for Chat ───────────────────────────────

export async function getActiveCartForChat(chatId: string) {
  const cart = await prisma.cart.findFirst({
    where: { chatId, status: 'active', expiresAt: { gt: new Date() } },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, brand: true, stockQuantity: true, status: true, images: true } },
          variant: { select: { id: true, variantName: true, stockQuantity: true, attributes: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return cart;
}

// ─── Get Cart with Items ────────────────────────────────────

export async function getCartWithItems(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, brand: true, stockQuantity: true, status: true, images: true } },
          variant: { select: { id: true, variantName: true, stockQuantity: true, attributes: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

type CartWithItems = NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>;

// ─── Add to Cart ────────────────────────────────────────────

export async function addToCart(input: AddToCartInput): Promise<{ success: boolean; message: string; cart?: CartWithItems }> {
  const { tenantId, chatId, customerPhone, productId, variantId, quantity } = input;

  if (quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
    return { success: false, message: `Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.` };
  }

  const cart = await getOrCreateCart(tenantId, chatId, customerPhone);

  // Fetch product + variant
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { where: { status: 'active' } } },
  });

  if (!product || product.status !== 'active') {
    return { success: false, message: 'This product is not available.' };
  }

  const variant = variantId ? product.variants.find(v => v.id === variantId) : null;
  if (variantId && !variant) {
    return { success: false, message: 'This variant is not available.' };
  }

  const stock = variant ? variant.stockQuantity : product.stockQuantity;
  const price = variant ? Number(variant.price) : Number(product.basePrice);

  // Check existing cart item for this product+variant
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  const newQuantity = (existingItem?.quantity || 0) + quantity;

  if (newQuantity > stock) {
    const msg = existingItem
      ? `Only ${stock} units available (you already have ${existingItem.quantity} in cart).`
      : `Only ${stock} units of ${product.name} are available.`;
    return { success: false, message: msg };
  }

  if (newQuantity > MAX_ITEM_QUANTITY) {
    return { success: false, message: `Maximum ${MAX_ITEM_QUANTITY} per item.` };
  }

  // Check max items limit (only if this is a new item)
  if (!existingItem) {
    const itemCount = await prisma.cartItem.count({ where: { cartId: cart.id } });
    if (itemCount >= MAX_CART_ITEMS) {
      return { success: false, message: `Cart is full (max ${MAX_CART_ITEMS} items). Remove an item first or proceed to checkout.` };
    }
  }

  // Create or update cart item
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity, price },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        price,
      },
    });
  }

  // Refresh cart expiry
  await prisma.cart.update({
    where: { id: cart.id },
    data: { expiresAt: new Date(Date.now() + CART_EXPIRY_MS) },
  });

  const fullCart = await getCartWithItems(cart.id);
  return { success: true, message: 'Added to cart!', cart: fullCart! };
}

// ─── Remove from Cart ───────────────────────────────────────

export async function removeFromCart(
  cartId: string,
  productId: string,
  variantId?: string | null
): Promise<{ success: boolean; message: string; cart?: CartWithItems }> {
  const item = await prisma.cartItem.findFirst({
    where: { cartId, productId, variantId: variantId || null },
  });

  if (!item) {
    return { success: false, message: 'Item not found in cart.' };
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  const fullCart = await getCartWithItems(cartId);
  return { success: true, message: 'Removed from cart.', cart: fullCart! };
}

// ─── Format Cart Message ────────────────────────────────────

export function formatCartMessage(cart: CartWithItems): string {
  if (!cart || cart.items.length === 0) {
    return 'Your cart is empty. Browse our products to start shopping!';
  }

  const lines: string[] = [`Your Cart (${cart.items.length} item${cart.items.length > 1 ? 's' : ''}):\n`];

  let total = 0;
  cart.items.forEach((item, i) => {
    const name = item.product.name;
    const variantLabel = item.variant ? ` (${item.variant.variantName})` : '';
    const price = Number(item.price);
    const subtotal = price * item.quantity;
    total += subtotal;

    lines.push(`${i + 1}. ${name}${variantLabel} x${item.quantity} - Rs.${subtotal.toLocaleString('en-IN')}`);
  });

  lines.push(`\nTotal: Rs.${total.toLocaleString('en-IN')}`);
  lines.push(`\nReply "checkout" to place your order, or keep browsing!`);

  return lines.join('\n');
}

// ─── Validate Cart Stock ────────────────────────────────────

export async function validateCartStock(cartId: string): Promise<{ valid: boolean; issues: string[] }> {
  const cart = await getCartWithItems(cartId);
  if (!cart) return { valid: false, issues: ['Cart not found.'] };

  const issues: string[] = [];

  for (const item of cart.items) {
    if (!item.product || item.product.status !== 'active') {
      issues.push(`${item.product?.name || 'Unknown product'} is no longer available.`);
      continue;
    }

    const stock = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
    if (item.quantity > stock) {
      if (stock === 0) {
        issues.push(`${item.product.name} is out of stock.`);
      } else {
        issues.push(`${item.product.name}: only ${stock} available, you have ${item.quantity} in cart.`);
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

// ─── Convert Cart to Order Items ────────────────────────────

export async function convertCartToOrderItems(cartId: string) {
  const cart = await getCartWithItems(cartId);
  if (!cart || cart.items.length === 0) return null;

  const items = cart.items.map(item => ({
    productId: item.productId,
    variantId: item.variantId || undefined,
    productName: item.product.name,
    variantName: item.variant?.variantName,
    price: Number(item.price),
    quantity: item.quantity,
  }));

  // Mark cart as converted
  await prisma.cart.update({
    where: { id: cartId },
    data: { status: 'converted' },
  });

  return items;
}
