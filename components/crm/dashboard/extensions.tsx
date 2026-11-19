import Link from 'next/link';
import { ArrowRight, FileText, IndianRupee, Plug, Plus } from 'lucide-react';
import { btn } from '../button-styles';
import type { DashboardData } from '@/lib/crm/mock/dashboard';

const ICONS = [FileText, IndianRupee];

export function Extensions({ items }: { items: DashboardData['extensions'] }) {
  return (
    <section aria-labelledby="ext-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="ext-title" className="t-h3">Modular Extensions</h2>
          <p className="t-small text-muted-foreground">Plug-and-play widgets for inventory tracking, CRM deals and fiscal modules</p>
        </div>
        <Link href="/app/settings" className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy hover:underline">
          <Plus className="h-4 w-4" aria-hidden />Add Module
        </Link>
      </div>
      <div className="crm-stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((x, i) => {
          const Icon = ICONS[i] ?? FileText;
          return (
            <Link key={x.title} href={x.href} className="crm-card crm-card-hover group flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-secondary"><Icon className="h-4 w-4 text-brand" strokeWidth={2.25} aria-hidden /></span>
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{x.tag}</span>
              </div>
              <h3 className="t-h3 mt-4">{x.title}</h3>
              <p className="t-body mt-1 text-muted-foreground">{x.body}</p>
              <div className="mt-auto flex items-center justify-between pt-4 text-[12px]">
                <span className="num flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />{x.footer}</span>
                <span className="flex items-center gap-1 font-bold text-navy">{x.cta}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
              </div>
            </Link>
          );
        })}
        <div className="crm-card flex flex-col items-center justify-center !border-dashed !border-[#c3c9db] !bg-white/50 p-5 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm"><Plug className="h-4 w-4 text-navy" aria-hidden /></span>
          <h3 className="t-h3 mt-3">Ready for Custom Hook</h3>
          <p className="t-small mt-1 text-muted-foreground">Connect Shiprocket, Bluedart or a custom warehouse endpoint in 1 click.</p>
          <Link href="/app/settings" className={`${btn.outline} mt-4`}>Mount Integration</Link>
        </div>
      </div>
    </section>
  );
}
