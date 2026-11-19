'use client';

import { useMemo, useState } from 'react';
import { Phone, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { inr } from '@/lib/crm/format';
import type { Customer, Segment } from '@/lib/crm/mock/customers';
import { StatusBadge } from '../status-badge';
import { btn } from '../button-styles';
import { useModule } from '../module-page';

const SEGMENTS: [Segment | 'all', string][] = [['all', 'All'], ['vip', 'VIP'], ['follow_up', 'Needs follow-up'], ['new', 'New'], ['regular', 'Regular']];
const SEG_TONE = { vip: 'accent', follow_up: 'danger', new: 'info', regular: 'neutral' } as const;
const SEG_LABEL = { vip: 'VIP', follow_up: 'Follow up', new: 'New', regular: 'Regular' } as const;

export function CustomersView({ customers }: { customers: Customer[] }) {
  const { label } = useModule('customers');
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<Segment | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState('');

  const list = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/\s/g, '');
    return customers.filter((c) => (seg === 'all' || c.segment === seg) && (!t || `${c.name}${c.phone}${c.city}`.toLowerCase().replace(/\s/g, '').includes(t)));
  }, [customers, q, seg]);
  const open = customers.find((c) => c.id === openId) ?? null;
  const totalSpent = customers.reduce((a, c) => a + c.spent, 0);
  const counts = { all: customers.length, vip: customers.filter((c) => c.segment === 'vip').length, follow: customers.filter((c) => c.segment === 'follow_up').length };

  const addNote = () => {
    const t = draft.trim(); if (!t || !open) return;
    setNotes((n) => ({ ...n, [open.id]: [...(n[open.id] ?? []), t] })); setDraft('');
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[[`Total ${label.toLowerCase()}`, String(counts.all)], ['VIP', String(counts.vip)], ['Lifetime value', inr(totalSpent)]].map(([k, v]) => (
          <div key={k} className="crm-card p-4"><p className="t-label text-muted-foreground">{k}</p><p className="t-h2 mt-1">{v}</p></div>
        ))}
      </div>

      <div className="crm-card p-0">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, number or city" aria-label={`Search ${label}`}
              className="h-10 w-full rounded-full border border-white/90 bg-white/80 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Segment">
            {SEGMENTS.map(([k, l]) => (
              <button key={k} aria-pressed={seg === k} onClick={() => setSeg(k)}
                className={cn('rounded-full px-3 py-1 text-[12px] font-semibold transition-all', seg === k ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:bg-white hover:text-ink')}>{l}</button>
            ))}
          </div>
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="t-micro border-y border-white/80 text-muted-foreground">
              {['Name', 'Source', 'Orders', 'Spent', 'Last contact', 'Segment'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-white/60 transition-colors hover:bg-white/60">
                  <td className="px-4 py-3">
                    <button onClick={() => setOpenId(c.id)} className="text-left font-semibold text-ink underline-offset-2 hover:underline">{c.name}</button>
                    <div className="t-small text-muted-foreground">{c.phone} · {c.city}</div>
                  </td>
                  <td className="px-4 py-3">{c.source}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold">{inr(c.spent)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lastContact}</td>
                  <td className="px-4 py-3"><StatusBadge tone={SEG_TONE[c.segment]}>{SEG_LABEL[c.segment]}</StatusBadge></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No {label.toLowerCase()} match this search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {open && (<>
            <DialogHeader>
              <DialogTitle>{open.name}</DialogTitle>
              <DialogDescription>{open.phone} · {open.email} · {open.city}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Orders', String(open.orders)], ['Spent', inr(open.spent)], ['Source', open.source]].map(([k, v]) => (
                <div key={k} className="crm-soft rounded-2xl p-3"><p className="t-small text-muted-foreground">{k}</p><p className="font-semibold text-ink">{v}</p></div>
              ))}
            </div>
            <div>
              <h3 className="t-label mb-2">Activity</h3>
              <ul className="space-y-1.5 text-sm">{open.activity.map((a) => <li key={a.id} className="flex justify-between gap-3"><span>{a.text}</span><span className="text-muted-foreground">{a.time}</span></li>)}</ul>
            </div>
            <div>
              <h3 className="t-label mb-2">Notes</h3>
              <ul className="mb-2 space-y-1 text-sm">{[...open.notes, ...(notes[open.id] ?? [])].map((n, i) => <li key={i} className="crm-soft rounded-xl px-3 py-1.5">{n}</li>)}
                {open.notes.length + (notes[open.id]?.length ?? 0) === 0 && <li className="text-muted-foreground">No notes yet.</li>}</ul>
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Add a note" aria-label="Add a note"
                  className="h-10 flex-1 rounded-full border border-white/90 bg-white/80 px-4 text-sm focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
                <button onClick={addNote} className={btn.brand}>Add</button>
              </div>
              <p className="t-small mt-1 text-muted-foreground">Notes are kept in this session only (simulated).</p>
            </div>
            <a href={`tel:${open.phone.replace(/\s/g, '')}`} className={cn(btn.outline, 'w-full')}><Phone className="h-4 w-4" aria-hidden />Call {open.name.split(' ')[0]}</a>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
