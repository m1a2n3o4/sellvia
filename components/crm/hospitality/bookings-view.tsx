'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import { confirmBlocker, fmt, nights } from '@/lib/crm/availability';
import { resolveWorkflows } from '@/lib/crm/config/resolve';
import type { StatusTone } from '@/lib/crm/config/types';
import type { Booking, RoomType } from '@/lib/crm/mock/hospitality';
import { StatusBadge } from '../status-badge';
import { WorkflowActions } from '../workflow-actions';
import { useCrm } from '../crm-context';
import { useModule } from '../module-page';

const TONE: Record<StatusTone, 'neutral' | 'info' | 'accent' | 'success' | 'danger'> = { neutral: 'neutral', info: 'info', warning: 'accent', success: 'success', danger: 'danger' };

export function BookingsView({ bookings: initial, rooms }: { bookings: Booking[]; rooms: RoomType[] }) {
  const { workspace } = useCrm();
  const { label } = useModule('bookings');
  const wf = resolveWorkflows(workspace.templates).find((w) => w.module === 'bookings');
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const room = (id: string) => rooms.find((r) => r.id === id)!;
  const st = (k: string) => wf?.statuses.find((s) => s.key === k);
  const list = bookings.filter((b) => filter === 'all' || b.status === filter);
  const open = bookings.find((b) => b.id === openId) ?? null;
  const arriving = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const revenue = bookings.filter((b) => b.paid && !['cancelled', 'refunded'].includes(b.status)).reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Awaiting confirmation', String(pending)], ['Confirmed, upcoming', String(arriving)], ['Paid revenue', inr(revenue)]].map(([k, v]) => (
          <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>))}
      </div>
      <div className="crm-card p-0">
        <div className="flex flex-wrap gap-1.5 p-4" role="group" aria-label="Status">
          {[{ key: 'all', label: 'All' }, ...(wf?.statuses ?? [])].map((s) => (
            <button key={s.key} aria-pressed={filter === s.key} onClick={() => setFilter(s.key)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', filter === s.key ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{s.label}</button>))}
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="t-micro border-y border-white/80 text-muted-foreground">{['Booking', 'Room', 'Stay', 'Guests', 'Amount', 'Status'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((b) => { const s = st(b.status); return (
                <tr key={b.id} className="border-b border-white/60 hover:bg-white/60">
                  <td className="px-4 py-3"><button onClick={() => setOpenId(b.id)} className="font-semibold text-ink underline-offset-2 hover:underline">#{b.id}</button><div className="t-small text-muted-foreground">{b.guest}</div></td>
                  <td className="px-4 py-3">{b.rooms} × {room(b.roomTypeId).name}</td>
                  <td className="px-4 py-3">{fmt(b.checkIn)} to {fmt(b.checkOut)}<div className="t-small text-muted-foreground">{nights(b.checkIn, b.checkOut)} night(s)</div></td>
                  <td className="px-4 py-3">{b.guests}</td>
                  <td className="px-4 py-3"><span className="font-semibold">{inr(b.amount)}</span><div className="t-small text-muted-foreground">{b.paid ? 'Paid' : 'Unpaid'}</div></td>
                  <td className="px-4 py-3"><StatusBadge tone={s ? TONE[s.tone] : 'neutral'}>{s?.label ?? b.status}</StatusBadge></td>
                </tr>); })}
              {list.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No {label.toLowerCase()} in this status.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {open && (<>
            <DialogHeader><DialogTitle>Booking #{open.id}</DialogTitle><DialogDescription>{open.guest} · {open.guests} guests</DialogDescription></DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[['Room', `${open.rooms} × ${room(open.roomTypeId).name}`], ['Nights', String(nights(open.checkIn, open.checkOut))], ['Check-in', fmt(open.checkIn)], ['Check-out', fmt(open.checkOut)], ['Amount', inr(open.amount)], ['Payment', open.paid ? 'Paid' : 'Unpaid']].map(([k, v]) => (
                <div key={k} className="crm-soft rounded-2xl p-3"><dt className="t-small text-muted-foreground">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>))}
            </dl>
            <div>
              <h3 className="t-label mb-2">Move to</h3>
              <WorkflowActions workflow={wf} status={open.status}
                guard={(to) => (to === 'confirmed' ? confirmBlocker(open, room(open.roomTypeId), bookings) : null)}
                onMove={(to) => setBookings((bs) => bs.map((b) => (b.id === open.id ? { ...b, status: to } : b)))} />
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
