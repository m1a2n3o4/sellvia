'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight, MessageSquareText, Phone, PhoneCall, Users, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../../button-styles';
import { LiveDot } from './live-dot';
import type { WaData } from '@/lib/crm/mock/whatsapp';

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export function WhatsAppOverview({ data, onOpenChat }: { data: WaData; onOpenChat: (id: string) => void }) {
  const [showAllWants, setShowAllWants] = useState(false);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [range, setRange] = useState<'today' | 'total'>('today');
  const { map } = data;
  const stages = [
    { label: 'Enquiry chats', sub: 'customers today', value: String(map.chats) },
    { label: 'New customers', sub: 'first time on WhatsApp', value: String(map.newCustomers) },
    { label: 'Enquired', sub: 'asked about products', value: String(map.enquired) },
    { label: 'Orders', sub: 'placed so far', value: String(map.orders) },
  ];
  const nums = [map.chats, map.newCustomers, map.enquired, map.orders];
  const wants = showAllWants ? data.wants : data.wants.slice(0, 4);
  const complaints = showAllComplaints ? data.complaints : data.complaints.slice(0, 4);
  const maxStop = Math.max(...data.stopped.reasons.map((r) => (range === 'today' ? r.today : r.total)));

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <section aria-label="WhatsApp summary" className="crm-stagger grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="crm-card crm-card-hover p-5">
          <p className="t-micro flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5 text-brand" aria-hidden />Customers from WhatsApp</p>
          <p className="t-h1 num mt-2">{data.totalCustomers.toLocaleString('en-IN')}</p>
          <p className="t-small text-muted-foreground">all time</p>
        </div>
        <div className="crm-card crm-card-hover p-5">
          <div className="flex items-center justify-between"><p className="t-micro text-muted-foreground">Today&apos;s enquiries</p><LiveDot /></div>
          <p className="t-h1 num crm-blink mt-2">{data.todayEnquiries}</p>
          <p className="t-small text-muted-foreground">still coming in</p>
        </div>
        <div className="crm-card crm-card-hover p-5">
          <p className="t-micro flex items-center gap-1.5 text-muted-foreground"><UserX className="h-3.5 w-3.5 text-brand" aria-hidden />Enquired and stopped</p>
          <p className="t-h1 num mt-2">{data.stopped.total}</p>
          <p className="t-small text-muted-foreground"><span className="num font-bold text-ink">{data.stopped.today}</span> today</p>
        </div>
        <div className="crm-card crm-card-hover p-5 ring-1 ring-danger/30">
          <p className="t-micro flex items-center gap-1.5 text-danger"><AlertTriangle className="h-3.5 w-3.5" aria-hidden />Complaints</p>
          <p className="t-h1 num mt-2 !text-danger">{data.complaintsTotal}</p>
          <p className="t-small text-muted-foreground">need your attention</p>
        </div>
        <div className="crm-card crm-card-hover col-span-2 p-5 lg:col-span-1">
          <p className="t-micro flex items-center gap-1.5 text-muted-foreground"><PhoneCall className="h-3.5 w-3.5 text-brand" aria-hidden />Want to talk to you</p>
          <p className="t-h1 num mt-2">{data.wantsTotal}</p>
          <p className="t-small text-muted-foreground">waiting for your call</p>
        </div>
      </section>

      {/* Today's map */}
      <section className="crm-card p-5 sm:p-6" aria-labelledby="map-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 id="map-title" className="t-h3">Today&apos;s map</h2><p className="t-small text-muted-foreground">How today&apos;s chats are turning into money. Still going on.</p></div>
          <LiveDot label="Live, still going on" />
        </div>
        <ol className="mt-5 grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
          {stages.map((s, i) => (
            <li key={s.label} className="contents">
              <div className="crm-soft rounded-[24px] p-4 text-center">
                <p className="t-h2 num">{s.value}</p>
                <p className="mt-1 text-sm font-bold text-ink">{s.label}</p>
                <p className="t-small text-muted-foreground">{s.sub}</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground md:flex-col" aria-hidden>
                <span className="crm-flow hidden h-0.5 w-8 md:block" />
                <ChevronRight className="h-4 w-4 rotate-90 md:rotate-0" />
                <span className="num whitespace-nowrap">{i < 3 ? `${pct(nums[i + 1], nums[i])}%` : `${inr(Math.round(map.amount / map.orders))} avg`}</span>
              </div>
            </li>
          ))}
          <li className="rounded-[24px] bg-primary p-4 text-center text-white shadow-[0_14px_28px_-14px_rgba(11,12,17,0.7)]">
            <p className="t-h2 num !text-brand">{inr(map.amount)}</p>
            <p className="mt-1 text-sm font-bold text-white">Credited to your account</p>
            <p className="t-small text-white/60">from {map.orders} orders</p>
          </li>
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Why stopped */}
        <section className="crm-card p-5 sm:p-6" aria-labelledby="stop-title">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 id="stop-title" className="t-h3">Why people stopped</h2><p className="t-small text-muted-foreground">{data.stopped.total} people enquired and stopped. {data.stopped.today} today.</p></div>
            <div className="flex rounded-full bg-secondary p-0.5 text-[12px] font-semibold" role="group" aria-label="Range">
              {(['today', 'total'] as const).map((r) => (
                <button key={r} aria-pressed={range === r} onClick={() => setRange(r)} className={cn('rounded-full px-3 py-1 capitalize transition-all', range === r ? 'bg-primary text-white' : 'text-muted-foreground hover:text-ink')}>{r === 'today' ? 'Today' : 'All time'}</button>
              ))}
            </div>
          </div>
          <ul className="mt-5 space-y-3.5">
            {data.stopped.reasons.map((r, i) => {
              const v = range === 'today' ? r.today : r.total;
              return (
                <li key={r.label}>
                  <div className="flex justify-between text-sm"><span className="font-semibold text-ink">{r.label}</span><span className="num font-bold text-ink">{v}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div key={range} className={cn('crm-fill h-full rounded-full', i === 0 ? 'bg-primary' : 'bg-brand')} style={{ width: `${Math.max(6, pct(v, maxStop))}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Complaints */}
        <section className="crm-card p-5 ring-1 ring-danger/25 sm:p-6" aria-labelledby="cmp-title">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 id="cmp-title" className="t-h3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-danger" aria-hidden />Complaints, urgent</h2><p className="t-small text-muted-foreground">{data.complaintsTotal} customers raised complaints. Tap one to read the chat.</p></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.complaintReasons.map((r) => <span key={r.label} className="rounded-full bg-danger/10 px-2.5 py-1 text-[11px] font-bold text-danger">{r.label} <span className="num">{r.n}</span></span>)}
          </div>
          <ul className="mt-4 space-y-2">
            {complaints.map((c) => (
              <li key={c.id}>
                <button onClick={() => onOpenChat(c.chatId)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/70 p-3 text-left transition-all hover:bg-white hover:shadow-md">
                  <span className="min-w-0"><span className="flex items-center gap-2 text-sm"><span className="font-bold text-ink">{c.name}</span><span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">{c.reason}</span></span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.text}</span></span>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">{c.ago}<ChevronRight className="h-4 w-4" aria-hidden /></span>
                </button>
              </li>
            ))}
          </ul>
          {data.complaints.length > 4 && (
            <button onClick={() => setShowAllComplaints((v) => !v)} className="mt-3 text-[13px] font-bold text-ink hover:underline">{showAllComplaints ? 'Show fewer' : `Show all ${data.complaintsTotal}`}</button>
          )}
        </section>
      </div>

      {/* Want to talk first */}
      <section className="crm-card p-5 sm:p-6" aria-labelledby="talk-title">
        <h2 id="talk-title" className="t-h3">Customers who want to talk to you first</h2>
        <p className="t-small text-muted-foreground">{data.wantsTotal} people asked for you. Open the chat or call them back.</p>
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {wants.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 rounded-[24px] bg-white/70 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-ink">{w.name}<span className="text-[11px] font-medium text-muted-foreground">{w.ago}</span></p>
                <p className="t-small mt-0.5 text-muted-foreground">{w.why}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => onOpenChat(w.chatId)} className={cn(btn.outline, '!h-9 !w-9 !px-0')} aria-label={`Open chat with ${w.name}`} title="Open chat"><MessageSquareText className="h-4 w-4" aria-hidden /></button>
                <a href={`tel:${w.phone.replace(/\s/g, '')}`} className={cn(btn.navy, '!h-9 !px-3.5')} aria-label={`Call ${w.name}`}><Phone className="h-4 w-4 text-brand" aria-hidden />Call</a>
              </div>
            </li>
          ))}
        </ul>
        {data.wants.length > 4 && (
          <button onClick={() => setShowAllWants((v) => !v)} className="mt-4 text-[13px] font-bold text-ink hover:underline">{showAllWants ? 'Show fewer' : `Show all ${data.wantsTotal}`}</button>
        )}
      </section>
    </div>
  );
}
