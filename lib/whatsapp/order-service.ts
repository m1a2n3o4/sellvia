import { prisma } from '@/lib/db/prisma';
import { sendOrderNotificationSms } from '@/lib/sms/notifications';

interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface CreateOrderInput {
  tenantId: string;
  customerPhone: string;
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
  chatId?: string;
  orderType?: 'online' | 'offline' | 'whatsapp' | 'website';
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'pending';
  notes?: string;
  customerEmail?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shippingFee?: number;
  storeId?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `ORD-${yy}${mm}${dd}`;
}

export async function createOrder(input: CreateOrderInput) {
  const {
    tenantId,
    customerPhone,
    customerName,
    deliveryAddress,
    items,
    chatId,
    orderType = 'whatsapp',
    paymentMethod,
    paymentStatus = 'unpaid',
    notes,
    customerEmail,
    city,
    state,
    pincode,
    shippingFee = 0,
    storeId,
  } = input;

  // Normalize phone: strip +91 prefix, keep last 10 digits
  const mobile = customerPhone.replace(/^\+?91/, '').slice(-10);

  const order = await prisma.$transaction(async (tx) => {
    // Find or create customer by phone
    let customer = await tx.customer.findUnique({
      where: { tenantId_mobile: { tenantId, mobile } },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          tenantId,
          name: customerName,
          mobile,
          ...(customerEmail ? { email: customerEmail } : {}),
          ...(city ? { city } : {}),
          ...(state ? { state } : {}),
          ...(pincode ? { pincode } : {}),
        },
      });
    } else {
      // Update customer info if new fields provided
      const updates: Record<string, string> = {};
      if (customerEmail && !customer.email) updates.email = customerEmail;
      if (city && !customer.city) updates.city = city;
      if (state && !customer.state) updates.state = state;
      if (pincode && !customer.pincode) updates.pincode = pincode;
      if (Object.keys(updates).length > 0) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: updates,
        });
      }
    }

    // Generate order number
    const prefix = generateOrderNumber();
    const countToday = await tx.order.count({
      where: {
        tenantId,
        orderNumber: { startsWith: prefix },
      },
    });
    const orderNumber = `${prefix}-${String(countToday + 1).padStart(3, '0')}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shippingFee;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        tenantId,
        storeId: storeId || null,
        orderNumber,
        customerId: customer.id,
        orderType,
        paymentMethod: paymentMethod || (orderType === 'website' ? 'cod' : 'razorpay'),
        paymentStatus,
        deliveryAddress,
        subtotal,
        shippingFee,
        total,
        notes,
        chatId,
        orderItems: {
          create: items.map((item) => ({
            tenantId,
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { customer: true, orderItems: true },
    });

    // Decrement stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }

    // Update customer stats
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: total },
        ...(deliveryAddress && !customer.address ? { address: deliveryAddress } : {}),
      },
    });

    return newOrder;
  });

  // Send SMS notification to owner (fire-and-forget)
  sendOrderNotificationSms({
    tenantId,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    total: Number(order.total),
    itemCount: items.length,
  }).catch((err) => console.error('[SMS] Order notification failed:', err));

  return order;
}

// Backward-compatible alias
export const createOrderFromWhatsApp = createOrder;

export type { CreateOrderInput, CreateOrderInput as CreateWhatsAppOrderInput, OrderItem };
