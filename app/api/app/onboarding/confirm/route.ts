import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { getLiveConfig } from '@/lib/config/server';

export const dynamic = 'force-dynamic';

/**
 * Owner confirms the business type(s) they chose. Tenant comes from the login cookie, never from the body.
 * Ids are checked against the LIVE release: only active business types can be chosen.
 */
export async function POST(req: NextRequest) {
  let tenantId: string;
  try { tenantId = await getTenantId(req); } catch { return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); }
  let body: { businessTypes?: unknown; businessName?: unknown } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const ids = Array.isArray(body.businessTypes) ? Array.from(new Set(body.businessTypes.filter((x): x is string => typeof x === 'string'))) : [];
  if (ids.length < 1 || ids.length > 4) return NextResponse.json({ error: 'Choose between 1 and 4 business types' }, { status: 400 });
  const live = await getLiveConfig();
  const valid = new Set(live.config.taxonomy.filter((n) => n.level === 3 && n.active).map((n) => n.id));
  if (ids.some((id) => !valid.has(id))) return NextResponse.json({ error: 'One of the business types is not available' }, { status: 400 });

  const name = typeof body.businessName === 'string' ? body.businessName.trim().slice(0, 100) : '';
  try {
    const existing = await prisma.tenantBusinessConfig.findUnique({ where: { tenantId } });
    await prisma.tenantBusinessConfig.upsert({
      where: { tenantId },
      update: { businessTypes: ids as never, configVersion: live.version, confirmedAt: new Date(), onboardingSource: existing?.onboardingSource ?? 'manual' },
      create: { tenantId, businessTypes: ids as never, configVersion: live.version, confirmedAt: new Date(), onboardingSource: 'manual', selfServe: false },
    });
    if (name.length >= 2) await prisma.tenant.update({ where: { id: tenantId }, data: { businessName: name } });
    return NextResponse.json({ ok: true, businessTypes: ids, configVersion: live.version });
  } catch (e) {
    console.error('[onboarding] confirm failed', e);
    return NextResponse.json({ error: 'Could not save. The database may not be ready yet.' }, { status: 503 });
  }
}
