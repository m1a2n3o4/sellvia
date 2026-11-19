import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { listConversations } from '@/lib/instagram/conversations';
import { attachProfiles } from '@/lib/instagram/profiles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(request); } catch { return NextResponse.json({ error: 'Login required' }, { status: 401 }); }
  const conversations = await listConversations(tenantId);
  try { await attachProfiles(tenantId, conversations); } catch { /* names are optional */ }
  return NextResponse.json({ conversations });
}
