import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/middleware';
import { getLiveConfig, getTenantBusiness } from '@/lib/config/server';

export const dynamic = 'force-dynamic';

/** The live release and this owner's business types. Tenant comes from the login cookie only. */
export async function GET(req: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(req); } catch { return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); }
  const [live, biz] = await Promise.all([getLiveConfig(), getTenantBusiness(tenantId)]);
  return NextResponse.json({ version: live.version, config: live.config, businessTypes: biz.businessTypes });
}
