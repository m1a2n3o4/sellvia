'use client';

import { ArrowDownRight, ArrowUpRight, Clock, Download, MoonStar, Sparkles, Timer } from 'lucide-react';
import { btn } from '../../button-styles';
import type { WaData } from '@/lib/crm/mock/whatsapp';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const delta = (a: number, b: number) => Math.round(((a - b) / b) * 100);

function Delta({ now, prev }: { now: number; prev: number }) {
  const d = delta(now, prev); const up = d >= 0;
  return <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{up ? <ArrowUpRight className="h-3 w-3" aria-hidden /> : <ArrowDownRight className="h-3 w-3" aria-hidden />}{Math.abs(d)}%</span>;
}

export function WhatsAppReports({ data }: { data: WaData }) {
  const y = data.yesterday; const h = data.helped;
  const exportCsv = () => {
    const rows = [['Metric', 'Value'], ['Enquiries', y.enquiries], ['New customers', y.newCustomers], ['Orders', y.orders], ['Money received (INR)', y.money], ['Chats handled by AI (%)', y.aiHandledPct], ['Average AI response', y.avgResponse], ['Complaints', y.complaints], ['Stopped after enquiry', y.stopped]];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'whatsapp-yesterday-report.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const max = Math.max(...h.week);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-primary p-6 text-white shadow-[0_22px_44px_-18px_rgba(11,12,17,0.7)] sm:p-8" aria-labelledby="saved-title">
        <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60"><Clock className="h-3.5 w-3.5 text-brand" aria-hidden />Time SatyaSell saved you this month</p>
            <p id="saved-title" className="num mt-2 text-6xl font-bold tracking-tight text-brand">{h.hoursSaved}<span className="ml-1 text-2xl text-white/70">hours</span></p>
            <p className="mt-2 max-w-sm text-sm text-white/70">Your AI answered <span className="num font-bold text-white">{h.messagesMonth.toLocaleString('en-IN')}</span> customer messages. At about {h.minutesPerMessage} minutes each by hand, that is the time you got back.</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Hours saved per day, last 7 days</p>
            <div className="mt-3 flex h-28 items-end gap-2" role="img" aria-label="Hours saved per day">
              {h.week.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`crm-bar w-full rounded-full ${i === 6 ? 'bg-brand' : 'bg-white/20'}`} style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 60}ms` }} />
                  <span className="text-[10px] text-white/50">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="crm-card p-5 sm:p-6" aria-labelledby="yday-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 id="yday-title" className="t-h3">What happened yesterday</h2><p className="t-small text-muted-foreground">Compared with the day before.</p></div>
          <button onClick={exportCsv} className={btn.outline}><Download className="h-4 w-4" aria-hidden />Download report</button>
        </div>
        <dl className="crm-stagger mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: 'Enquiries', v: String(y.enquiries), d: <Delta now={y.enquiries} prev={y.prev.enquiries} /> },
            { l: 'Orders', v: String(y.orders), d: <Delta now={y.orders} prev={y.prev.orders} /> },
            { l: 'Money received', v: inr(y.money), d: <Delta now={y.money} prev={y.prev.money} /> },
            { l: 'New customers', v: String(y.newCustomers) },
            { l: 'Chats handled by AI', v: `${y.aiHandledPct}%` },
            { l: 'Avg AI response', v: y.avgResponse },
            { l: 'Complaints', v: String(y.complaints) },
            { l: 'Stopped after enquiry', v: String(y.stopped) },
          ].map((k) => (
            <div key={k.l} className="crm-soft rounded-[24px] p-4">
              <dt className="t-micro text-muted-foreground">{k.l}</dt>
              <dd className="t-h2 num mt-1">{k.v}</dd>
              {k.d && <dd className="mt-1">{k.d}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="How SatyaSell helped">
        {[
          { icon: Timer, title: 'Instant replies', big: y.avgResponse, body: 'Average AI reply time. Customers do not wait for you to be free.' },
          { icon: MoonStar, title: 'Orders while you were away', big: String(h.afterHoursOrders), body: `${inr(h.afterHoursMoney)} came in outside your working hours this month.` },
          { icon: Sparkles, title: 'Handled without you', big: `${y.aiHandledPct}%`, body: 'Of yesterday\'s chats were fully handled by the AI. You only stepped in for the rest.' },
        ].map((c) => (
          <article key={c.title} className="crm-card crm-card-hover p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><c.icon className="h-[18px] w-[18px] text-brand" aria-hidden /></span>
            <p className="t-micro mt-3 text-muted-foreground">{c.title}</p>
            <p className="t-h1 num mt-1">{c.big}</p>
            <p className="t-body mt-1 text-muted-foreground">{c.body}</p>
          </article>
        ))}
      </section>
      <p className="px-2 text-xs text-muted-foreground">All figures are simulated sample data. Hours saved is an estimate: messages answered by the AI multiplied by minutes per message.</p>
    </div>
  );
}
