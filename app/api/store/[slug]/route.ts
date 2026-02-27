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
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { storeSlug: params.slug },
      include: {
        tenant: { select: { id: true, status: true } },
      },
    });

    if (!businessInfo || !businessInfo.storeEnabled || businessInfo.tenant.status !== 'active') {
      return NextResponse.json(
        { error: 'Store not found', storeDisabled: businessInfo?.storeEnabled === false },
        { status: 404 }
      );
    }

    // Get distinct categories from active products
    const categories = await prisma.product.findMany({
      where: { tenantId: businessInfo.tenantId, status: 'active', category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    // Build WhatsApp number for contact button
    let whatsappNumber: string | null = null;
    if (businessInfo.shareOwnerPhone && businessInfo.ownerPhone) {
      whatsappNumber = businessInfo.ownerPhone.replace(/^\+?/, '');
    }

    return NextResponse.json({
      tenantId: businessInfo.tenantId,
      storeName: businessInfo.storeName,
      storeSlug: businessInfo.storeSlug,
      storeLogo: businessInfo.storeLogo,
      storeBanner: businessInfo.storeBanner,
      storeThemeColor: businessInfo.storeThemeColor || '#2563eb',
      storeDescription: businessInfo.storeDescription || businessInfo.description,
      deliveryFee: Number(businessInfo.deliveryFee),
      minOrderAmount: Number(businessInfo.minOrderAmount),
      codEnabled: businessInfo.codEnabled,
      onlinePayEnabled: businessInfo.onlinePayEnabled,
      whatsappNumber,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('[Store API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
