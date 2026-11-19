import Link from 'next/link';
import { Zap } from 'lucide-react';
import { PageHeader } from '@/components/crm/page-header';
import { btn } from '@/components/crm/button-styles';
import { KpiRow } from '@/components/crm/dashboard/kpi-row';
import { LeadFeed } from '@/components/crm/dashboard/lead-feed';
import { CampaignCard, ServiceHealth } from '@/components/crm/dashboard/side-panels';
import { Extensions } from '@/components/crm/dashboard/extensions';
import { ExportButton } from '@/components/crm/dashboard/export-button';
import { getDashboard } from '@/lib/crm/services/insights';

export default async function CrmHome() {
  const d = await getDashboard();
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />All automations live
            </span>
            <span className="text-xs text-muted-foreground">Synced node: BOM-1A (simulated)</span>
          </>
        }
        title="Overview & Telemetry"
        description="Real-time omnichannel sales telemetry, catalog triggers and automated conversion pipelines."
        actions={
          <>
            <span className="inline-flex h-9 items-center rounded-2xl border border-border bg-white px-3 text-[13px] font-medium text-[#001d3d]">Today, {today}</span>
            <ExportButton data={d} />
            <Link href="/app/marketing/campaigns/new" className={btn.navy}><Zap className="h-4 w-4 text-brand" aria-hidden />Trigger Campaign</Link>
          </>
        }
      />
      <KpiRow d={d} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><LeadFeed items={d.feed} total={d.totalInteractions} /></div>
        <div className="space-y-4">
          <CampaignCard c={d.campaign} />
          <ServiceHealth items={d.health} />
        </div>
      </div>
      <Extensions items={d.extensions} />
    </div>
  );
}
