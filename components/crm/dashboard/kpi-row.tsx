import { ShoppingCart, TrendingUp } from 'lucide-react';
import type { DashboardData } from '@/lib/crm/mock/dashboard';

const label = 't-micro text-muted-foreground';

export function KpiRow({ d }: { d: DashboardData }) {
  return (
    <section aria-label="Key metrics" className="crm-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Gross retail volume */}
      <div className="crm-card crm-card-hover flex flex-col p-5">
        <div className="flex items-start justify-between">
          <p className={label}>Gross Retail Volume</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-navy">
            <TrendingUp className="h-3 w-3" aria-hidden />{d.gross.delta}
          </span>
        </div>
        <p className="t-h2 num mt-3">{d.gross.value}</p>
        <p className="t-small mt-1 text-muted-foreground">{d.gross.vs}</p>
        <div className="mt-4 flex h-12 items-end gap-1.5" role="img" aria-label="Last 7 days volume">
          {d.gross.bars.map((h, i) => (
            <div key={i} className={`crm-bar flex-1 rounded-sm ${i === d.gross.bars.length - 1 ? 'bg-brand' : 'bg-[#dce9ff]'}`} style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>

      {/* Active DM leads */}
      <div className="crm-card crm-card-hover flex flex-col p-5">
        <div className="flex items-start justify-between">
          <p className={label}>Active DM Leads</p>
          <span className="rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-ink">{d.leads.highIntent} High Intent</span>
        </div>
        <p className="t-h2 num mt-3">{d.leads.active} Active</p>
        <p className="t-small mt-1 text-muted-foreground">{d.leads.awaiting}</p>
        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex justify-between text-[11px]">
            <span className="text-muted-foreground">SLA Compliance</span>
            <span className="num font-bold text-navy">{d.leads.slaLabel}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#dce9ff]">
            <div className="crm-fill h-full rounded-full bg-navy" style={{ width: `${d.leads.slaPct}%` }} />
          </div>
        </div>
      </div>

      {/* Recovered carts */}
      <div className="crm-card crm-card-hover flex flex-col p-5">
        <div className="flex items-start justify-between">
          <p className={label}>Recovered Carts</p>
          <ShoppingCart className="h-4 w-4 text-brand" aria-hidden />
        </div>
        <p className="t-h2 num mt-3">{d.recovered.value}</p>
        <p className="t-small mt-1 text-muted-foreground">{d.recovered.note}</p>
        <div className="mt-auto flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-navy"><span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />WA Bot Conversion</span>
          <span className="num font-bold text-navy">{d.recovered.botConv}</span>
        </div>
      </div>

      {/* AI response */}
      <div className="crm-card crm-card-hover flex flex-col p-5">
        <div className="flex items-start justify-between">
          <p className={label}>AI Response Rate</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-1.5 py-0.5 text-[11px] font-bold text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />{d.ai.rate}
          </span>
        </div>
        <p className="t-h2 num mt-3">{d.ai.avg}</p>
        <p className="t-small mt-1 text-muted-foreground">{d.ai.note}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex -space-x-2">
            {d.ai.integrations.map((t, i) => (
              <span key={t} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold ${i === 2 ? 'bg-brand text-ink' : 'bg-navy text-white'}`}>{t}</span>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">{d.ai.live} integrations live</span>
        </div>
      </div>
    </section>
  );
}
