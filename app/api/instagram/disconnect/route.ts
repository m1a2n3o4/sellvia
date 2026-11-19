import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { disconnectInstagram } from '@/lib/instagram/disconnect';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Disconnect Instagram for the logged-in business. Body: { deleteMessages?: boolean }.
export async function POST(request: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.json({ error: 'Login required' }, { status: 401 }); }
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, ...(await disconnectInstagram(tenantId, body?.deleteMessages === true)) });
}
