import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { getIgConfig } from './config';
import { parseSignedRequest } from './state';

/** Shared by deauthorize and data-deletion: verify signed_request, find the accounts it refers to. */
export async function readMetaRequest(request: NextRequest) {
  const conf = getIgConfig();
  if (!conf.ok) return { error: new NextResponse('Not configured', { status: 503 }) } as const;
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(form ? String(form.get('signed_request') || '') : null, conf.cfg.appSecret);
  if (!data?.user_id) return { error: new NextResponse('Invalid request', { status: 400 }) } as const;
  const id = String(data.user_id);
  const accounts = await prisma.instagramAccount.findMany({ where: { OR: [{ metaUserId: id }, { igAccountId: id }] }, select: { igAccountId: true } });
  return { id, ids: accounts.map((a) => a.igAccountId) } as const;
}

export const newConfirmation = () => crypto.randomUUID();
export { NextResponse };
