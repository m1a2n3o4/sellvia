import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * Conversations on SatyaSell's own WhatsApp number (platform_messages).
 *  - no query:        list of conversations (one per phone), newest first
 *  - ?phone=<digits>: full transcript for that person (matches on last 10 digits)
 */
export async function GET(request: NextRequest) {
  try {
    await getSuperAdminId(request);

    const phoneParam = request.nextUrl.searchParams.get('phone');
    if (phoneParam) {
      const last10 = phoneParam.replace(/\D/g, '').slice(-10);
      if (last10.length !== 10) {
        return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
      }
      const messages = await prisma.platformMessage.findMany({
        where: { phone: { endsWith: last10 }, role: { notIn: ['store', 'tenantstore'] } },
        orderBy: { createdAt: 'asc' },
        take: 500,
        select: { id: true, role: true, content: true, createdAt: true },
      });
      return NextResponse.json({ messages });
    }

    const groups = await prisma.platformMessage.groupBy({
      by: ['phone'],
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
      take: 200,
    });

    const phones = groups.map((g) => g.phone);
    const [lastUser, enquiries] = await Promise.all([
      Promise.all(
        phones.map((phone) =>
          prisma.platformMessage.findFirst({
            where: { phone, role: { in: ['user', 'assistant'] } },
            orderBy: { createdAt: 'desc' },
            select: { role: true, content: true },
          })
        )
      ),
      prisma.enquiry.findMany({
        where: { message: { startsWith: '[WhatsApp]' }, mobile: { in: phones.map((p) => p.slice(-10)) } },
        select: { mobile: true, name: true },
      }),
    ]);
    const nameByMobile = new Map(enquiries.map((e) => [e.mobile, e.name]));

    const conversations = groups.map((g, i) => ({
      phone: g.phone,
      name: nameByMobile.get(g.phone.slice(-10)) || null,
      messageCount: g._count._all,
      lastAt: g._max.createdAt,
      lastRole: lastUser[i]?.role || null,
      lastMessage: lastUser[i]?.content?.slice(0, 120) || '',
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching platform chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
