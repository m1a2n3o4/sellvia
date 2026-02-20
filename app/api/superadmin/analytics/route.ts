import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await getSuperAdminId(request);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [totalAll, totalToday, totalWeek, totalMonth, byCountry, byDevice, byReferrer, dailyTrend] =
      await Promise.all([
        prisma.pageView.count(),
        prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.pageView.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.pageView.groupBy({
          by: ['country'],
          _count: true,
          orderBy: { _count: { country: 'desc' } },
          take: 20,
          where: { country: { not: null } },
        }),
        prisma.pageView.groupBy({
          by: ['device'],
          _count: true,
          where: { device: { not: null } },
        }),
        prisma.pageView.groupBy({
          by: ['referrer'],
          _count: true,
          orderBy: { _count: { referrer: 'desc' } },
          take: 20,
          where: { referrer: { not: null } },
        }),
        prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*)::int as count
          FROM page_views
          WHERE created_at >= ${monthStart}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,
      ]);

    return NextResponse.json({
      totals: { all: totalAll, today: totalToday, week: totalWeek, month: totalMonth },
      byCountry,
      byDevice,
      byReferrer,
      dailyTrend,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
