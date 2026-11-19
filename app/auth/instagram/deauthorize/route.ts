// Meta "Deauthorize callback URL": the user removed the app. Disconnect and wipe the token.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { readMetaRequest } from '@/lib/instagram/deletion';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const r = await readMetaRequest(request);
  if ('error' in r) return r.error;
  if (r.ids.length) await prisma.instagramAccount.updateMany({ where: { igAccountId: { in: r.ids } }, data: { status: 'disconnected', tokenEnc: '' } });
  else console.warn('[Instagram] deauthorize: no matching account (verify which id Meta sends on first test)');
  return NextResponse.json({ ok: true });
}
