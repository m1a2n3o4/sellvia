import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, getRateLimitKey } from '@/lib/store/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(getRateLimitKey(ip, 'store-products'), 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Resolve tenant from slug
    const businessInfo = await prisma.businessInfo.findUnique({
      where: { storeSlug: params.slug },
      select: { tenantId: true, storeEnabled: true },
    });

    if (!businessInfo || !businessInfo.storeEnabled) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(40, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const productId = searchParams.get('id'); // For single product detail

    // Single product lookup
    if (productId) {
      const product = await prisma.product.findFirst({
        where: { id: productId, tenantId: businessInfo.tenantId, status: 'active' },
        include: { variants: { where: { status: 'active' }, orderBy: { variantName: 'asc' } } },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Get related products (same category, exclude current)
      const related = product.category
        ? await prisma.product.findMany({
            where: {
              tenantId: businessInfo.tenantId,
              status: 'active',
              category: product.category,
              id: { not: product.id },
            },
            take: 4,
            orderBy: { createdAt: 'desc' },
          })
        : [];

      return NextResponse.json({ product, related });
    }

    // Product listing with filters
    const where: any = {
      tenantId: businessInfo.tenantId,
      status: 'active',
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: { where: { status: 'active' }, orderBy: { variantName: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[Store Products API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
