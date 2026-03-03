import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET - List all stores for tenant
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true, orders: true, customers: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('[Stores GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

// POST - Create a new store
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, logo, banner, themeColor, accentColor, deliveryFee, minOrderAmount, codEnabled, onlinePayEnabled, address, city, state, pincode, phone } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Store name and URL slug are required' }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json({ error: 'Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only' }, { status: 400 });
    }

    // Check max stores per tenant (limit 10)
    const storeCount = await prisma.store.count({ where: { tenantId } });
    if (storeCount >= 10) {
      return NextResponse.json({ error: 'Maximum 10 stores per account' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'This store URL is already taken' }, { status: 409 });
    }

    // Also check legacy BusinessInfo slugs
    const legacySlug = await prisma.businessInfo.findFirst({
      where: { storeSlug: slug, tenantId: { not: tenantId } },
    });
    if (legacySlug) {
      return NextResponse.json({ error: 'This store URL is already taken' }, { status: 409 });
    }

    const store = await prisma.store.create({
      data: {
        tenantId,
        name,
        slug,
        description: description || null,
        logo: logo || null,
        banner: banner || null,
        themeColor: themeColor || '#2563eb',
        accentColor: accentColor || '#f59e0b',
        deliveryFee: deliveryFee || 0,
        minOrderAmount: minOrderAmount || 0,
        codEnabled: codEnabled !== undefined ? codEnabled : true,
        onlinePayEnabled: onlinePayEnabled !== undefined ? onlinePayEnabled : true,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        phone: phone || null,
        isDefault: storeCount === 0, // First store is default
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('[Stores POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}
