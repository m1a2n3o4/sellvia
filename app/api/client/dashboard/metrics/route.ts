import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      totalCustomers,
      lowStockCount,
      todayRevenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId, status: 'active' } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.count({
        where: { tenantId, orderDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.customer.count({ where: { tenantId } }),
      prisma.product.count({
        where: {
          tenantId,
          status: 'active',
          stockQuantity: { lte: 10 },
        },
      }),
      prisma.order.aggregate({
        where: {
          tenantId,
          orderDate: { gte: startOfToday, lte: endOfToday },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { tenantId },
        include: { customer: true, orderItems: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalOrders,
      todayOrders,
      thisWeekOrders: 0,
      thisMonthOrders: 0,
      totalCustomers,
      lowStockCount,
      todayRevenue: Number(todayRevenueResult._sum.total || 0),
      thisMonthRevenue: 0,
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
