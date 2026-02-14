import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { createOrderSchema } from '@/lib/validations/order';

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `ORD-${yy}${mm}${dd}`;
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const orderType = searchParams.get('orderType') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const deliveryStatus = searchParams.get('deliveryStatus') || '';
    const today = searchParams.get('today') === 'true';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
      ];
    }

    if (orderType === 'online' || orderType === 'offline') {
      where.orderType = orderType;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (deliveryStatus) {
      where.deliveryStatus = deliveryStatus;
    }

    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      where.orderDate = { gte: startOfDay, lte: endOfDay };
    } else if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.orderDate = dateFilter;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          orderItems: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, customerName, customerMobile, customerId, ...orderData } = parsed.data;

    const order = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer;
      if (customerId) {
        customer = await tx.customer.findFirst({ where: { id: customerId, tenantId } });
      }
      if (!customer) {
        customer = await tx.customer.findUnique({
          where: { tenantId_mobile: { tenantId, mobile: customerMobile } },
        });
      }
      if (!customer) {
        customer = await tx.customer.create({
          data: { tenantId, name: customerName, mobile: customerMobile },
        });
      }

      // Generate order number
      const prefix = generateOrderNumber();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const countToday = await tx.order.count({
        where: {
          tenantId,
          orderNumber: { startsWith: prefix },
        },
      });
      const orderNumber = `${prefix}-${String(countToday + 1).padStart(3, '0')}`;

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal - (orderData.discount || 0) + (orderData.shippingFee || 0) + (orderData.tax || 0);

      // Create order
      const newOrder = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId: customer.id,
          orderType: orderData.orderType,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          deliveryAddress: orderData.deliveryAddress,
          discount: orderData.discount || 0,
          shippingFee: orderData.shippingFee || 0,
          tax: orderData.tax || 0,
          subtotal,
          total,
          notes: orderData.notes,
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
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
