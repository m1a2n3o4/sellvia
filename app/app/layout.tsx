import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { verifyJWT } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { isReviewTenant, splitIds } from '@/lib/crm/access';
import { AppShell } from '@/components/crm/app-shell';
import { getLiveConfig, getTenantBusiness } from '@/lib/config/server';
import { templatesFor } from '@/lib/crm/config/taxonomy/menu';
import { ancestorChain } from '@/lib/crm/config/taxonomy/resolve-form';
import type { Workspace } from '@/lib/crm/types';
import { CrmProvider } from '@/components/crm/crm-context';
import { IS_SIMULATED, getCurrentUser, listWorkspaces } from '@/lib/crm/services/workspaces';
import './crm.css';

const crmFont = Urbanist({ subsets: ['latin'], variable: '--font-crm', display: 'swap' });

export const metadata: Metadata = { title: 'SatyaSell CRM', robots: { index: false, follow: false } };

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  let reviewer: { businessName: string } | null = null;
  let real: { tenantId: string } | null = null;
  if (process.env.NODE_ENV !== 'production' && process.env.CRM_REVIEW_PREVIEW === 'true') reviewer = { businessName: 'Demo business' }; // local preview of reviewer mode
  if (process.env.NODE_ENV === 'production') {
    // 1) Feature flag: hidden until CRM_ENABLED=true (Meta App Review safety).
    if (process.env.CRM_ENABLED !== 'true') notFound();
    // 2) Must be a logged-in business (same client_token cookie as /client, which stays untouched).
    let tenantId: string | null = null;
    try {
      const token = cookies().get('client_token')?.value;
      if (token) tenantId = ((await verifyJWT(token)).tenantId as string | undefined) ?? null;
    } catch { tenantId = null; }
    if (!tenantId) redirect('/signin');
    // 3) Optional allow-list: CRM_ALLOWED_TENANTS="id1,id2". When set, every other business gets a 404.
    const allow = splitIds(process.env.CRM_ALLOWED_TENANTS);
    const review = isReviewTenant(tenantId);
    // Owners who registered themselves on the website (self-serve) are always allowed in.
    const biz = review ? null : await getTenantBusiness(tenantId);
    if (biz?.selfServe) real = { tenantId };
    else if (allow.length > 0 && !allow.includes(tenantId) && !review) notFound();
    // 4) Reviewer tenants get a clean view: only Inbox + Instagram, real business name, no sample content.
    if (review) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { businessName: true } });
      reviewer = { businessName: t?.businessName || 'Your business' };
    }
  }

  // Real self-serve owner: their own workspace on the published configuration. Sample businesses are never shown to them.
  let serverConfig: { version: number; config: Awaited<ReturnType<typeof getLiveConfig>>['config'] } | null = null;
  let realUser: { name: string; initials: string; role: 'owner' } | null = null;
  let realWorkspaces: Workspace[] | null = null;
  if (real) {
    const [live, biz, t] = await Promise.all([
      getLiveConfig(), getTenantBusiness(real.tenantId),
      prisma.tenant.findUnique({ where: { id: real.tenantId }, select: { clientName: true, businessName: true } }),
    ]);
    serverConfig = { version: live.version, config: live.config };
    // Ignore types that were later deactivated or removed from the live release.
    const valid = new Set(live.config.taxonomy.filter((n) => n.level === 3 && n.active).map((n) => n.id));
    const types = biz.businessTypes.filter((id) => valid.has(id));
    const name = t?.businessName || t?.clientName || 'My business';
    let industry = ''; try { industry = ancestorChain(types[0] ?? '', live.config)[0]?.name ?? ''; } catch { /* none chosen */ }
    realUser = { name: t?.clientName || name, initials: (t?.clientName || name).slice(0, 2).toUpperCase(), role: 'owner' };
    realWorkspaces = [{
      id: real.tenantId, real: true, needsSetup: types.length === 0, name, branch: name, industry, websiteUrl: '',
      templates: types.length ? templatesFor(types, live.config) : ['legacy_retail'], businessTypes: types.length ? types : undefined,
      branches: [name], plan: 'FREE', aiUsagePct: 0, instagramConnected: false, badges: {}, notifications: [],
    }];
  }

  // Reviewers never receive the sample businesses or the sample user at all.
  const [user, workspaces] = realUser && realWorkspaces
    ? [realUser, realWorkspaces]
    : reviewer
      ? [{ name: reviewer.businessName, initials: '', role: 'owner' as const }, []]
      : await Promise.all([getCurrentUser(), listWorkspaces()]);
  return (
    <div className={crmFont.variable}>
      <CrmProvider user={user} workspaces={workspaces} simulated={IS_SIMULATED} fontClass={crmFont.variable} reviewer={reviewer} serverConfig={serverConfig}>
        <AppShell>{children}</AppShell>
      </CrmProvider>
    </div>
  );
}
