import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    const store = await prisma.demoStore.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ store });
  } catch (e) {
    console.error('demo-store GET', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    const b = await request.json();
    const store = await prisma.demoStore.update({
      where: { id: params.id },
      data: {
        ...(b.name !== undefined && { name: String(b.name).trim() }),
        ...(b.tagline !== undefined && { tagline: b.tagline ? String(b.tagline).slice(0, 200) : null }),
        ...(b.city !== undefined && { city: b.city ? String(b.city).slice(0, 100) : null }),
        ...(b.shopPhone !== undefined && { shopPhone: b.shopPhone ? String(b.shopPhone).slice(0, 30) : null }),
        ...(b.extraRules !== undefined && { extraRules: b.extraRules ? String(b.extraRules).slice(0, 2000) : null }),
        ...(b.status !== undefined && ['active', 'paused'].includes(b.status) && { status: b.status }),
      },
    });
    return NextResponse.json({ store });
  } catch (e) {
    console.error('demo-store PUT', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    await prisma.demoStore.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('demo-store DELETE', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
