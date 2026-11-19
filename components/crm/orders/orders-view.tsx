'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import type { Order } from '@/lib/crm/mock/catalogue';
import { resolveWorkflows } from '@/lib/crm/config/resolve';
import type { StatusTone } from '@/lib/crm/config/types';
import { StatusBadge } from '../status-badge';
import { btn } from '../button-styles';
import { useCrm } from '../crm-context';
import { useModule } from '../module-page';

const TONE: Record<StatusTone, 'neutral' | 'info' | 'accent' | 'success' | 'danger'> = { neutral: 'neutral', info: 'info', warning: 'accent', success: 'success', danger: 'danger' };
const total = (o: Order) => o.lines.reduce((a, l) => a + l.qty * l.price, 0);

export function OrdersView({ orders: initial }: { orders: Order[] }) {
  const { workspace } = useCrm();
  const { label } = useModule('orders');
  const wf = resolveWorkflows(workspace.templates).find((w) => w.module === 'orders');
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const st = (k: string) => wf?.statuses.find((s) => s.key === k);
  const list = useMemo(() => orders.filter((o) => filter === 'all' || o.status === filter), [orders, filter]);
  const open = orders.find((o) => o.id === openId) ?? null;
  const revenue = orders.filter((o) => o.paid && !['cancelled', 'refunded'].includes(o.status)).reduce((a, o) => a + total(o), 0);
  const active = orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length;
  const advance = (id: string, to: string) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: to } : o)));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[[`Total ${label.toLowerCase()}`, String(orders.length)], ['In progress', String(active)], ['Paid revenue', inr(revenue)]].map(([k, v]) => (
          <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>))}
      </div>
      <div className="crm-card p-0">
        <div className="flex flex-wrap gap-1.5 p-4" role="group" aria-label="Status">
          {[{ key: 'all', label: 'All' }, ...(wf?.statuses ?? [])].map((s) => (
            <button key={s.key} aria-pressed={filter === s.key} onClick={() => setFilter(s.key)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', filter === s.key ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{s.label}</button>))}
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="t-micro border-y border-white/80 text-muted-foreground">{['Order', 'Customer', 'Channel', 'Total', 'Payment', 'Status'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((o) => { const s = st(o.status); return (
                <tr key={o.id} className="border-b border-white/60 hover:bg-white/60">
                  <td className="px-4 py-3"><button onClick={() => setOpenId(o.id)} className="font-semibold text-ink underline-offset-2 hover:underline">#{o.id}</button><div className="t-small text-muted-foreground">{o.date}</div></td>
                  <td className="px-4 py-3">{o.customer}</td><td className="px-4 py-3">{o.channel}</td>
                  <td className="px-4 py-3 font-semibold">{inr(total(o))}</td>
                  <td className="px-4 py-3"><StatusBadge tone={o.paid ? 'success' : 'accent'}>{o.paid ? 'Paid' : 'Unpaid'}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge tone={s ? TONE[s.tone] : 'neutral'}>{s?.label ?? o.status}</StatusBadge></td>
                </tr>); })}
              {list.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No {label.toLowerCase()} in this status.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {open && (<>
            <DialogHeader><DialogTitle>Order #{open.id}</DialogTitle><DialogDescription>{open.customer} · {open.channel} · {open.date}</DialogDescription></DialogHeader>
            <ul className="divide-y divide-border text-sm">
              {open.lines.map((l) => <li key={l.name} className="flex justify-between gap-3 py-2"><span>{l.qty} × {l.name}</span><span className="font-semibold">{inr(l.qty * l.price)}</span></li>)}
              <li className="flex justify-between py-2 font-bold"><span>Total</span><span>{inr(total(open))}</span></li>
            </ul>
            <div>
              <h3 className="t-label mb-2">Progress</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {(wf?.statuses ?? []).filter((s) => !['cancelled', 'refunded'].includes(s.key)).map((s, i, arr) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-[12px] font-semibold', s.key === open.status ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground')}>{s.label}</span>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />}
                  </span>))}
              </div>
            </div>
            {(st(open.status)?.next.length ?? 0) > 0 ? (
              <div>
                <h3 className="t-label mb-2">Move to</h3>
                <div className="flex flex-wrap gap-2">{st(open.status)!.next.map((n) => <button key={n} onClick={() => advance(open.id, n)} className={n === 'cancelled' || n === 'refunded' ? btn.outline : btn.brand}>{st(n)?.label ?? n}</button>)}</div>
                <p className="t-small mt-2 text-muted-foreground">Only steps allowed by the workflow are offered. Changes are simulated.</p>
              </div>
            ) : <p className="t-small text-muted-foreground">This order is complete. No further steps.</p>}
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
