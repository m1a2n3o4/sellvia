import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { verifyJWT } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { isReviewTenant, splitIds } from '@/lib/crm/access';
import { AppShell } from '@/components/crm/app-shell';
import { CrmProvider } from '@/components/crm/crm-context';
import { IS_SIMULATED, getCurrentUser, listWorkspaces } from '@/lib/crm/services/workspaces';
import './crm.css';

const crmFont = Urbanist({ subsets: ['latin'], variable: '--font-crm', display: 'swap' });

export const metadata: Metadata = { title: 'SatyaSell CRM', robots: { index: false, follow: false } };

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  let reviewer: { businessName: string } | null = null;
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
    if (!tenantId) redirect('/client/login');
    // 3) Optional allow-list: CRM_ALLOWED_TENANTS="id1,id2". When set, every other business gets a 404.
    const allow = splitIds(process.env.CRM_ALLOWED_TENANTS);
    const review = isReviewTenant(tenantId);
    if (allow.length > 0 && !allow.includes(tenantId) && !review) notFound();
    // 4) Reviewer tenants get a clean view: only Inbox + Instagram, real business name, no sample content.
    if (review) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { businessName: true } });
      reviewer = { businessName: t?.businessName || 'Your business' };
    }
  }

  // Reviewers never receive the sample businesses or the sample user at all.
  const [user, workspaces] = reviewer
    ? [{ name: reviewer.businessName, initials: '', role: 'owner' as const }, []]
    : await Promise.all([getCurrentUser(), listWorkspaces()]);
  return (
    <div className={crmFont.variable}>
      <CrmProvider user={user} workspaces={workspaces} simulated={IS_SIMULATED} fontClass={crmFont.variable} reviewer={reviewer}>
        <AppShell>{children}</AppShell>
      </CrmProvider>
    </div>
  );
}
