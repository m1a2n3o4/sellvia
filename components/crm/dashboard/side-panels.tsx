import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { btn } from '../button-styles';
import type { DashboardData } from '@/lib/crm/mock/dashboard';

export function CampaignCard({ c }: { c: DashboardData['campaign'] }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-navy p-5 text-white shadow-[var(--shadow-rest)]" aria-label="Active campaign">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5 blur-2xl" aria-hidden />
      <span className="inline-block rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">{c.tag}</span>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">{c.title}</h2>
      <p className="t-small mt-1.5 text-[#a5c8ff]">{c.blurb}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a5c8ff]">Attributed Revenue</p>
          <p className="num text-xl font-bold text-brand">{c.revenue}</p>
        </div>
        <Link href="/app/marketing" className="inline-flex h-8 items-center rounded-2xl bg-white px-3 text-[12px] font-bold text-navy transition-colors hover:bg-[#eff4ff]">Manage Blast</Link>
      </div>
    </section>
  );
}

export function ServiceHealth({ items }: { items: DashboardData['health'] }) {
  return (
    <section className="crm-card p-5" aria-label="Service health">
      <div className="flex items-center justify-between">
        <h2 className="t-micro text-muted-foreground">Service Health</h2>
        <span className="relative flex h-2 w-2" aria-label="All systems operational">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
        </span>
      </div>
      <dl className="mt-3 space-y-2.5 text-sm">
        {items.map((h) => (
          <div key={h.name} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{h.name}</dt>
            <dd className="num font-semibold text-ink">{h.value}</dd>
          </div>
        ))}
      </dl>
      <Link href="/app/automations" className={`${btn.ghost} mt-4 w-full bg-secondary`}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />Configure Rules
      </Link>
    </section>
  );
}
