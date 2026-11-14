import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || '';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const productWhere: Record<string, unknown> = { tenantId };
    const orderWhere: Record<string, unknown> = { tenantId };
    const customerWhere: Record<string, unknown> = { tenantId };
    if (storeId) {
      productWhere.storeId = storeId;
      orderWhere.storeId = storeId;
      customerWhere.storeId = storeId;
    }

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      totalCustomers,
      lowStockCount,
      todayRevenueResult,
      recentOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenueRes,
      receivedRes,
      weekOrders,
    ] = await Promise.all([
      prisma.product.count({ where: productWhere }),
      prisma.product.count({ where: { ...productWhere, status: 'active' } }),
      prisma.order.count({ where: orderWhere }),
      prisma.order.count({
        where: { ...orderWhere, orderDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.customer.count({ where: customerWhere }),
      prisma.product.count({
        where: {
          ...productWhere,
          status: 'active',
          stockQuantity: { lte: 10 },
        },
      }),
      prisma.order.aggregate({
        where: {
          ...orderWhere,
          orderDate: { gte: startOfToday, lte: endOfToday },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: orderWhere,
        include: { customer: true, orderItems: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.count({ where: { ...orderWhere, status: 'delivered' } }),
      prisma.order.count({ where: { ...orderWhere, status: { in: ['pending', 'confirmed', 'shipped'] } } }),
      prisma.order.count({ where: { ...orderWhere, status: 'cancelled' } }),
      prisma.order.aggregate({ where: { ...orderWhere, status: { not: 'cancelled' } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { ...orderWhere, paymentStatus: 'paid', status: { not: 'cancelled' } }, _sum: { total: true } }),
      prisma.order.findMany({
        where: { ...orderWhere, status: { not: 'cancelled' }, orderDate: { gte: new Date(startOfToday.getTime() - 6 * 86400000) } },
        select: { orderDate: true, total: true },
      }),
    ]);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfToday.getTime() - (6 - i) * 86400000);
      const next = new Date(d.getTime() + 86400000);
      const inDay = (weekOrders as { orderDate: Date; total: unknown }[]).filter((o) => o.orderDate >= d && o.orderDate < next);
      return {
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: inDay.reduce((s, o) => s + Number(o.total), 0),
        orders: inDay.length,
      };
    });
    const totalRevenue = Number(totalRevenueRes._sum.total || 0);
    const amountReceived = Number(receivedRes._sum.total || 0);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      thisWeekOrders: last7Days.reduce((s, d) => s + d.orders, 0),
      thisMonthOrders: 0,
      totalCustomers,
      lowStockCount,
      todayRevenue: Number(todayRevenueResult._sum.total || 0),
      thisMonthRevenue: 0,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      amountReceived,
      amountPending: Math.max(0, totalRevenue - amountReceived),
      last7Days,
      recentOrders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
