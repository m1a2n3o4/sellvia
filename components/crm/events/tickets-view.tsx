'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import { resolveWorkflows } from '@/lib/crm/config/resolve';
import type { StatusTone } from '@/lib/crm/config/types';
import type { EventItem, TicketBooking } from '@/lib/crm/mock/events';
import { StatusBadge } from '../status-badge';
import { WorkflowActions } from '../workflow-actions';
import { useCrm } from '../crm-context';
import { useModule } from '../module-page';

const TONE: Record<StatusTone, 'neutral' | 'info' | 'accent' | 'success' | 'danger'> = { neutral: 'neutral', info: 'info', warning: 'accent', success: 'success', danger: 'danger' };

export function TicketsView({ tickets: initial, events }: { tickets: TicketBooking[]; events: EventItem[] }) {
  const { workspace } = useCrm();
  const { label } = useModule('tickets');
  const wf = resolveWorkflows(workspace.templates).find((w) => w.module === 'tickets');
  const [tickets, setTickets] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const ev = (id: string) => events.find((e) => e.id === id)!;
  const tt = (b: TicketBooking) => ev(b.eventId).tickets.find((t) => t.id === b.ticketTypeId)!;
  const st = (k: string) => wf?.statuses.find((s) => s.key === k);
  const list = tickets.filter((t) => filter === 'all' || t.status === filter);
  const open = tickets.find((t) => t.id === openId) ?? null;
  const checkedIn = tickets.filter((t) => t.status === 'checked_in').reduce((a, t) => a + t.qty, 0);
  const revenue = tickets.filter((t) => ['confirmed', 'checked_in'].includes(t.status)).reduce((a, t) => a + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[[`Total ${label.toLowerCase()}`, String(tickets.length)], ['Guests checked in', String(checkedIn)], ['Confirmed revenue', inr(revenue)]].map(([k, v]) => (
          <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>))}
      </div>
      <div className="crm-card p-0">
        <div className="flex flex-wrap gap-1.5 p-4" role="group" aria-label="Status">
          {[{ key: 'all', label: 'All' }, ...(wf?.statuses ?? [])].map((s) => (
            <button key={s.key} aria-pressed={filter === s.key} onClick={() => setFilter(s.key)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', filter === s.key ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{s.label}</button>))}
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead><tr className="t-micro border-y border-white/80 text-muted-foreground">{['Booking', 'Event', 'Ticket', 'Qty', 'Amount', 'Status'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((b) => { const s = st(b.status); return (
                <tr key={b.id} className="border-b border-white/60 hover:bg-white/60">
                  <td className="px-4 py-3"><button onClick={() => setOpenId(b.id)} className="font-semibold text-ink underline-offset-2 hover:underline">#{b.id}</button><div className="t-small text-muted-foreground">{b.buyer}</div></td>
                  <td className="px-4 py-3">{ev(b.eventId).name}</td><td className="px-4 py-3">{tt(b).name}</td><td className="px-4 py-3">{b.qty}</td>
                  <td className="px-4 py-3 font-semibold">{inr(b.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge tone={s ? TONE[s.tone] : 'neutral'}>{s?.label ?? b.status}</StatusBadge></td>
                </tr>); })}
              {list.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nothing in this status.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={!!open} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {open && (<>
            <DialogHeader><DialogTitle>Booking #{open.id}</DialogTitle><DialogDescription>{open.buyer} · {ev(open.eventId).name}</DialogDescription></DialogHeader>
            <p className="text-sm">{open.qty} × {tt(open).name} · <span className="font-semibold">{inr(open.amount)}</span></p>
            <div className="rounded-2xl border border-dashed border-[#c3c9db] bg-white/50 p-4 text-center text-sm text-muted-foreground">Ticket QR code and scanning arrive with the backend phase.</div>
            <div>
              <h3 className="t-label mb-2">Move to</h3>
              <WorkflowActions workflow={wf} status={open.status}
                guard={(to) => (to === 'confirmed' && ev(open.eventId).status === 'past' ? 'This event has already happened.' : null)}
                onMove={(to) => setTickets((ts) => ts.map((t) => (t.id === open.id ? { ...t, status: to } : t)))} />
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
