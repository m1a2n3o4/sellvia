// Meta "Data deletion request URL": delete the user's Instagram data and return a confirmation code.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { newConfirmation, readMetaRequest } from '@/lib/instagram/deletion';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const r = await readMetaRequest(request);
  if ('error' in r) return r.error;
  if (r.ids.length) await prisma.instagramAccount.deleteMany({ where: { igAccountId: { in: r.ids } } }); // messages cascade
  else console.warn('[Instagram] data-deletion: no matching account (verify which id Meta sends on first test)');
  const code = newConfirmation();
  return NextResponse.json({ url: `https://www.satyasell.com/data-deletion?code=${code}`, confirmation_code: code });
}
