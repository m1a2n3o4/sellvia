import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, getRateLimitKey } from '@/lib/store/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(getRateLimitKey(ip, 'store-info'), 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      include: {
        tenant: {
          select: {
            status: true,
            businessInfo: {
              select: {
                ownerPhone: true,
                shareOwnerPhone: true,
              },
            },
          },
        },
      },
    });

    if (!store || !store.enabled || store.tenant.status !== 'active') {
      return NextResponse.json(
        { error: 'Store not found', storeDisabled: store?.enabled === false },
        { status: 404 }
      );
    }

    // Get distinct categories from active products in this store
    const categories = await prisma.product.findMany({
      where: { storeId: store.id, status: 'active', category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    // Build WhatsApp number for contact button
    let whatsappNumber: string | null = null;
    const bi = store.tenant.businessInfo;
    if (bi?.shareOwnerPhone && bi?.ownerPhone) {
      whatsappNumber = bi.ownerPhone.replace(/^\+?/, '');
    }

    return NextResponse.json({
      tenantId: store.tenantId,
      storeName: store.name,
      storeSlug: store.slug,
      storeLogo: store.logo,
      storeBanner: store.banner,
      storeThemeColor: store.themeColor || '#2563eb',
      storeAccentColor: store.accentColor || '#f59e0b',
      storeDescription: store.description,
      deliveryFee: Number(store.deliveryFee),
      minOrderAmount: Number(store.minOrderAmount),
      codEnabled: store.codEnabled,
      onlinePayEnabled: store.onlinePayEnabled,
      whatsappNumber,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('[Store API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
