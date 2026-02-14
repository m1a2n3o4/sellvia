import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { updateOrderSchema } from '@/lib/validations/order';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);

    const order = await prisma.order.findFirst({
      where: { id: params.id, tenantId },
      include: {
        customer: true,
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findFirst({
      where: { id: params.id, tenantId },
      include: { orderItems: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = parsed.data;

    // Handle cancellation - restore stock
    if (data.status === 'cancelled' && existing.status !== 'cancelled') {
      await prisma.$transaction(async (tx) => {
        // Restore stock for each item
        for (const item of existing.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        // Update customer stats
        await tx.customer.update({
          where: { id: existing.customerId },
          data: {
            totalOrders: { decrement: 1 },
            totalSpent: { decrement: Number(existing.total) },
          },
        });

        await tx.order.update({
          where: { id: params.id },
          data: {
            ...data,
            cancelledAt: new Date(),
          },
        });
      });

      const updated = await prisma.order.findFirst({
        where: { id: params.id },
        include: { customer: true, orderItems: true },
      });
      return NextResponse.json(updated);
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { customer: true, orderItems: true },
    });

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
