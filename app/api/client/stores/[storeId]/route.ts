import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET - Single store details
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { id: params.storeId, tenantId },
      include: { _count: { select: { products: true, orders: true, customers: true } } },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[Store GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

// PUT - Update store settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify store belongs to tenant
    const existing = await prisma.store.findFirst({
      where: { id: params.storeId, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name, slug, enabled, description, logo, banner,
      themeColor, accentColor, deliveryFee, minOrderAmount,
      codEnabled, onlinePayEnabled,
      address, city, state, pincode, phone,
    } = body;

    // Validate slug if changed
    if (slug && slug !== existing.slug) {
      const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 50) {
        return NextResponse.json({ error: 'Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only' }, { status: 400 });
      }

      const slugTaken = await prisma.store.findFirst({
        where: { slug, id: { not: params.storeId } },
      });
      if (slugTaken) {
        return NextResponse.json({ error: 'This store URL is already taken' }, { status: 409 });
      }
    }

    const store = await prisma.store.update({
      where: { id: params.storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(enabled !== undefined && { enabled }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(banner !== undefined && { banner }),
        ...(themeColor !== undefined && { themeColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(deliveryFee !== undefined && { deliveryFee }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(codEnabled !== undefined && { codEnabled }),
        ...(onlinePayEnabled !== undefined && { onlinePayEnabled }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(phone !== undefined && { phone }),
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('[Store PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

// DELETE - Delete a store
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { id: params.storeId, tenantId },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if it's the only store
    const storeCount = await prisma.store.count({ where: { tenantId } });
    if (storeCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete your only store' }, { status: 400 });
    }

    // Unassign products (set storeId to null, don't delete them)
    await prisma.product.updateMany({
      where: { storeId: params.storeId },
      data: { storeId: null },
    });

    // Delete the store
    await prisma.store.delete({ where: { id: params.storeId } });

    // If deleted store was default, make the oldest remaining store default
    if (store.isDefault) {
      const oldest = await prisma.store.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) {
        await prisma.store.update({
          where: { id: oldest.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Store DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}
