import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

const s = (v: any, max = 200) => (v == null || String(v).trim() === '' ? null : String(v).trim().slice(0, max));
const n = (v: any) => {
  const x = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(x) && x > 0 ? Math.round(x) : null;
};

/** Replaces the store's whole catalogue with the reviewed list. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    const { items } = await request.json();
    if (!Array.isArray(items) || items.length > 1000) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }
    const rows = items
      .map((i: any) => ({
        storeId: params.id,
        category: ['laptop', 'desktop', 'monitor', 'accessory', 'other'].includes(i.category) ? i.category : 'other',
        brand: s(i.brand, 60),
        model: s(i.model, 120),
        cpu: s(i.cpu, 80),
        ram: s(i.ram, 40),
        storage: s(i.storage, 60),
        screen: s(i.screen, 30),
        color: s(i.color, 40),
        condition: s(i.condition, 60),
        price: n(i.price),
        quantity: n(i.quantity),
        notes: s(i.notes, 300),
        imageUrl: s(i.imageUrl, 500),
      }))
      .filter((r) => r.brand || r.model);

    await prisma.$transaction([
      prisma.demoItem.deleteMany({ where: { storeId: params.id } }),
      prisma.demoItem.createMany({ data: rows }),
    ]);
    return NextResponse.json({ success: true, count: rows.length });
  } catch (e) {
    console.error('demo-store items PUT', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
