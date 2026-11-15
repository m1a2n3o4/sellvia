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
          orderBy: { createdAt: 'desc' }, // latest 100, reversed below
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

    return NextResponse.json({ ...chat, messages: [...chat.messages].reverse() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Delete a chat and its messages (orders created from it are kept).
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    const result = await prisma.whatsAppChat.deleteMany({ where: { id: params.id, tenantId } });
    if (result.count === 0) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
