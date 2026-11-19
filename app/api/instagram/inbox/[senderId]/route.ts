import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { getThread } from '@/lib/instagram/conversations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { senderId: string } }) {
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.json({ error: 'Login required' }, { status: 401 }); }
  if (!/^\d{5,30}$/.test(params.senderId)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  return NextResponse.json(await getThread(tenantId, params.senderId));
}
