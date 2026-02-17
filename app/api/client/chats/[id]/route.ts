import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);

    const chat = await prisma.whatsAppChat.findFirst({
      where: { id: params.id, tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Mark as read
    if (chat.unreadCount > 0) {
      await prisma.whatsAppChat.update({
        where: { id: chat.id },
        data: { unreadCount: 0 },
      });
    }

    return NextResponse.json(chat);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
