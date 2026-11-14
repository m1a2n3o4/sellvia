import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// POST { enabled: boolean } - make this business the AI ordering agent of the shared SatyaSell WhatsApp number.
// Only one business can be the agent at a time.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getSuperAdminId(request);
    const { enabled } = await request.json();

    const tenant = await prisma.tenant.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!tenant) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.tenant.updateMany({ where: { isPlatformAgent: true }, data: { isPlatformAgent: false } }),
      ...(enabled ? [prisma.tenant.update({ where: { id: params.id }, data: { isPlatformAgent: true } })] : []),
    ]);

    return NextResponse.json({ success: true, isPlatformAgent: !!enabled });
  } catch (error) {
    console.error('Error updating AI agent:', error);
    return NextResponse.json({ error: 'Failed to update AI agent' }, { status: 500 });
  }
}
