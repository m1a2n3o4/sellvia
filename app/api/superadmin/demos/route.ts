import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const tenants = await prisma.tenant.findMany({
      where: { isDemo: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, businessName: true, mobile: true, isPlatformAgent: true, createdAt: true,
        businessInfo: { select: { storeSlug: true, shareOwnerPhone: true } },
        stores: { select: { enabled: true, slug: true, logo: true, themeColor: true, accentColor: true }, take: 1 },
        products: { where: { status: 'active' }, select: { name: true, basePrice: true }, orderBy: { createdAt: 'asc' }, take: 3 },
        _count: { select: { products: true } },
      },
    });
    const ids = tenants.map((t) => t.id);
    const [realOrders, views] = await Promise.all([
      prisma.order.groupBy({ by: ['tenantId'], where: { tenantId: { in: ids }, isDemo: false }, _count: { _all: true } }),
      prisma.pageView.groupBy({ by: ['page'], where: { page: { startsWith: '/store/' } }, _count: { _all: true } }).catch(() => []),
    ]);
    const viewMap = new Map((views as any[]).map((v) => [v.page, v._count._all]));
    const ordMap = new Map(realOrders.map((o) => [o.tenantId, o._count._all]));
    return NextResponse.json({
      demos: tenants.map((t) => {
        const slug = t.stores[0]?.slug || t.businessInfo?.storeSlug || '';
        return {
          id: t.id,
          businessName: t.businessName,
          mobile: t.mobile,
          slug,
          products: t._count.products,
          enabled: t.stores[0]?.enabled ?? false,
          whatsappOrders: !!t.businessInfo?.shareOwnerPhone,
          isPlatformAgent: t.isPlatformAgent,
          testOrders: ordMap.get(t.id) || 0,
          pageViews: viewMap.get(`/store/${slug}`) || 0,
          logo: t.stores[0]?.logo || null,
          themeColor: t.stores[0]?.themeColor || '#2563eb',
          accentColor: t.stores[0]?.accentColor || '#f59e0b',
          sample: t.products.map((p) => ({ name: p.name, price: Number(p.basePrice) })),
          createdAt: t.createdAt,
        };
      }),
    });
  } catch (e) {
    console.error('demos list', e);
    return NextResponse.json({ error: 'Failed to load demos' }, { status: 500 });
  }
}
