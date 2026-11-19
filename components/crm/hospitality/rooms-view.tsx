'use client';

import { BedDouble, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import { addDays, fmt, unitsFree } from '@/lib/crm/availability';
import { MOCK_TODAY, type Booking, type RoomType } from '@/lib/crm/mock/hospitality';
import { StatusBadge } from '../status-badge';

const DAYS = 14;

export function RoomsView({ rooms, bookings }: { rooms: RoomType[]; bookings: Booking[] }) {
  const days = Array.from({ length: DAYS }, (_, i) => addDays(MOCK_TODAY, i));
  const tone = (free: number, units: number) => (free === 0 ? 'bg-danger/15 text-danger' : free <= Math.ceil(units / 3) ? 'bg-brand/25 text-ink' : 'bg-success/10 text-success');
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rooms.map((r) => (
          <div key={r.id} className="crm-card crm-card-hover p-5">
            <div className="flex items-center justify-between"><BedDouble className="h-5 w-5 text-brand" aria-hidden /><StatusBadge>{r.type}</StatusBadge></div>
            <h3 className="t-h3 mt-3">{r.name}</h3>
            <p className="t-small mt-0.5 flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" aria-hidden />Up to {r.maxGuests} guests · {r.units} rooms</p>
            <p className="mt-3 text-lg font-bold text-ink">{inr(r.basePrice)}<span className="t-small font-normal text-muted-foreground"> / night</span></p>
            <p className="t-small text-muted-foreground">Weekend {inr(r.weekendPrice)}</p>
            <div className="mt-3 flex flex-wrap gap-1">{r.amenities.map((a) => <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{a}</span>)}</div>
          </div>
        ))}
      </div>

      <section className="crm-card p-5" aria-labelledby="avail">
        <h2 id="avail" className="t-h3">Availability, next {DAYS} days</h2>
        <p className="t-small mb-3 text-muted-foreground">Rooms free each night, worked out from confirmed and checked-in stays. Pending bookings do not hold rooms. Simulated: the real booking service will do this with locking.</p>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-1 text-center text-[12px]">
            <thead><tr><th className="w-36 text-left font-semibold text-muted-foreground">Room</th>{days.map((d) => <th key={d} className="font-semibold text-muted-foreground">{fmt(d)}</th>)}</tr></thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td className="py-1 text-left text-[13px] font-semibold text-ink">{r.name}</td>
                  {days.map((d) => { const f = unitsFree(r, bookings, d); return (
                    <td key={d}><span title={`${f} of ${r.units} free`} className={cn('block rounded-xl py-1.5 font-bold', tone(f, r.units))}>{f}</span></td>); })}
                </tr>))}
            </tbody>
          </table>
        </div>
        <p className="t-small mt-3 flex flex-wrap gap-3 text-muted-foreground">
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-success/40" />Plenty</span>
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-brand" />Few left</span>
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-danger/50" />Full</span>
        </p>
      </section>
    </div>
  );
}
