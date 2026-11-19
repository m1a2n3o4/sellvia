'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import type { FeedItem } from '@/lib/crm/mock/dashboard';

const TONE = { brand: btn.brand, outline: btn.outline, soft: `${btn.small} bg-secondary text-navy hover:bg-[#dce9ff]` };

export function LeadFeed({ items, total }: { items: FeedItem[]; total: number }) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unread = items.filter((i) => i.unread).length;
  const shown = tab === 'all' ? items : items.filter((i) => i.unread);

  return (
    <section className="crm-card flex flex-col" aria-labelledby="feed-title">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-secondary text-navy"><Radio className="h-4 w-4" aria-hidden /></span>
          <div>
            <h2 id="feed-title" className="t-h3">Real-Time Lead & Sales Ingestion</h2>
            <p className="t-small text-muted-foreground">Webhook listener for retail showroom inquiries</p>
          </div>
        </div>
        <div className="flex shrink-0 rounded-full bg-secondary p-0.5 text-[12px] font-semibold" role="tablist" aria-label="Filter feed">
          {(['all', 'unread'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn('rounded-full px-2.5 py-1 capitalize transition-all', tab === t ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy')}>
              {t === 'unread' ? `Unread (${unread})` : 'All'}
            </button>
          ))}
        </div>
      </div>

      <ul className="px-5">
        {shown.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">No unread interactions.</li>}
        {shown.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 border-t border-muted py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-[12px] font-bold text-navy">
                {i.initials}
                {i.unread && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" aria-label="Unread" />}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-ink">{i.name}</span>
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-navy">{i.source}</span>
                  <span className="text-xs text-muted-foreground">{i.time}</span>
                </p>
                <p className="t-small mt-0.5 text-muted-foreground sm:truncate sm:max-w-[26rem]">{i.message}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
              <span className="num text-sm font-bold text-ink">{i.amount}</span>
              <Link href={i.action.href} className={cn(i.action.tone === 'soft' ? TONE.soft : `${TONE[i.action.tone]} h-8 px-3`)}>{i.action.label}</Link>
            </div>
          </li>
        ))}
      </ul>

      <Link href="/app/inbox" className="group mt-auto flex items-center justify-center gap-1.5 border-t border-muted py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-muted/60">
        View all {total} interactions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </section>
  );
}
