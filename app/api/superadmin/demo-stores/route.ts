import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function GET(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const stores = await prisma.demoStore.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ stores });
  } catch (e) {
    console.error('demo-stores GET', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getSuperAdminId(request);
    const b = await request.json();
    const name = String(b.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = slugify(b.slug || name);
    if (slug.length < 4) return NextResponse.json({ error: 'Store keyword must be at least 4 letters/digits' }, { status: 400 });
    if (await prisma.demoStore.findUnique({ where: { slug } })) {
      return NextResponse.json({ error: 'A store with this keyword already exists' }, { status: 409 });
    }
    const store = await prisma.demoStore.create({
      data: {
        slug,
        name,
        tagline: b.tagline ? String(b.tagline).slice(0, 200) : null,
        city: b.city ? String(b.city).slice(0, 100) : null,
        shopPhone: b.shopPhone ? String(b.shopPhone).slice(0, 30) : null,
        extraRules: b.extraRules ? String(b.extraRules).slice(0, 2000) : null,
        triggers: Array.isArray(b.triggers) ? b.triggers.map((t: any) => slugify(String(t))).filter((t: string) => t.length >= 4) : [],
      },
    });
    return NextResponse.json({ store }, { status: 201 });
  } catch (e) {
    console.error('demo-stores POST', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
