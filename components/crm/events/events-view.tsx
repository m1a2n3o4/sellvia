'use client';

import { CalendarDays, MapPin } from 'lucide-react';
import { inr } from '@/lib/crm/format';
import { fmt } from '@/lib/crm/availability';
import type { EventItem } from '@/lib/crm/mock/events';
import { StatusBadge } from '../status-badge';

export function EventsView({ events }: { events: EventItem[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {events.map((e) => {
        const cap = e.tickets.reduce((a, t) => a + t.capacity, 0);
        const sold = e.tickets.reduce((a, t) => a + t.sold, 0);
        const rev = e.tickets.reduce((a, t) => a + t.sold * t.price, 0);
        return (
          <article key={e.id} className="crm-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="t-h3">{e.name}</h2>
                <p className="t-small mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden />{fmt(e.start)}{e.end !== e.start && ` to ${fmt(e.end)}`}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{e.venue}</span>
                </p>
              </div>
              <StatusBadge tone={e.status === 'upcoming' ? 'success' : 'neutral'}>{e.status === 'upcoming' ? 'Upcoming' : e.status === 'past' ? 'Past' : 'Draft'}</StatusBadge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[['Sold', `${sold}/${cap}`], ['Revenue', inr(rev)], ['Categories', String(e.tickets.length)]].map(([k, v]) => <div key={k} className="crm-soft rounded-2xl p-2.5"><p className="t-small text-muted-foreground">{k}</p><p className="font-semibold text-ink">{v}</p></div>)}
            </div>
            <ul className="mt-4 space-y-3">
              {e.tickets.map((t) => { const pct = Math.round((t.sold / t.capacity) * 100); return (
                <li key={t.id}>
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold text-ink">{t.name} <span className="font-normal text-muted-foreground">{inr(t.price)}</span></span>
                    <span className="t-small text-muted-foreground">{t.sold === t.capacity ? 'Sold out' : `${t.capacity - t.sold} left`} · sales end {fmt(t.salesEnd)}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.name} sold`}>
                    <div className={`h-full rounded-full ${pct >= 100 ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>); })}
            </ul>
          </article>);
      })}
    </div>
  );
}
