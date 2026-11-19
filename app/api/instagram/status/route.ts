import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/** Real Instagram connection state for the logged-in business. Never returns tokens. */
export async function GET(request: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.json({ error: 'Login required' }, { status: 401 }); }
  const acct = await prisma.instagramAccount.findFirst({
    where: { tenantId, status: 'active' }, orderBy: { updatedAt: 'desc' },
    select: { igAccountId: true, username: true, createdAt: true, updatedAt: true },
  });
  if (!acct) return NextResponse.json({ connected: false });
  const messages = await prisma.instagramMessage.count({ where: { tenantId, igAccountId: acct.igAccountId } });
  return NextResponse.json({ connected: true, username: acct.username, connectedAt: acct.createdAt.toISOString(), messages });
}
