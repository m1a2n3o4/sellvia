import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'active';

    const where: Record<string, unknown> = { tenantId };

    if (status === 'active' || status === 'archived') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerPhone: { contains: search } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const chats = await prisma.whatsAppChat.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ chats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
