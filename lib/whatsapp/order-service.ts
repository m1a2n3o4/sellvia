import { prisma } from '@/lib/db/prisma';

interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface CreateWhatsAppOrderInput {
  tenantId: string;
  customerPhone: string;
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
  chatId?: string;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'pending';
  notes?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `ORD-${yy}${mm}${dd}`;
}

export async function createOrderFromWhatsApp(input: CreateWhatsAppOrderInput) {
  const {
    tenantId,
    customerPhone,
    customerName,
    deliveryAddress,
    items,
    chatId,
    paymentMethod,
    paymentStatus = 'unpaid',
    notes,
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
        data: { tenantId, name: customerName, mobile },
      });
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
    const total = subtotal;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId: customer.id,
        orderType: 'online',
        paymentMethod: paymentMethod || 'razorpay',
        paymentStatus,
        deliveryAddress,
        subtotal,
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

  return order;
}

export type { CreateWhatsAppOrderInput, OrderItem };
