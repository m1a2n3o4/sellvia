import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { sendReply } from '@/lib/instagram/conversations';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.json({ error: 'Login required' }, { status: 401 }); }
  const body = await request.json().catch(() => ({}));
  const result = await sendReply(tenantId, String(body?.senderId ?? ''), String(body?.text ?? ''));
  const status = result.ok ? 200 : result.code === 'WINDOW_CLOSED' ? 409 : result.code === 'META_ERROR' ? 502 : result.code === 'NOT_CONNECTED' ? 409 : 400;
  return NextResponse.json(result, { status });
}
