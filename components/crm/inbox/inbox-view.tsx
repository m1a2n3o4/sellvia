'use client';

import { useMemo, useState } from 'react';
import { Bot, ChevronLeft, MessageCircle, Instagram, Send, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Channel, Thread, ThreadState } from '@/lib/crm/mock/inbox';
import { StatusBadge } from '../status-badge';
import { btn } from '../button-styles';

const STATES: [ThreadState | 'all', string][] = [['all', 'All'], ['needs_you', 'Needs you'], ['ai', 'AI handling'], ['resolved', 'Resolved']];
const CHANNELS: [Channel | 'all', string][] = [['all', 'All channels'], ['WhatsApp', 'WhatsApp'], ['Instagram', 'Instagram']];
const STATE_BADGE = { needs_you: ['danger', 'Needs you'], ai: ['info', 'AI handling'], resolved: ['success', 'Resolved'] } as const;

export function InboxView({ threads: initial }: { threads: Thread[] }) {
  const [threads, setThreads] = useState(initial);
  const [state, setState] = useState<ThreadState | 'all'>('all');
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const list = useMemo(() => threads.filter((t) =>
    (state === 'all' || t.state === state) && (channel === 'all' || t.channel === channel) &&
    (!q.trim() || `${t.name}${t.handle}`.toLowerCase().includes(q.trim().toLowerCase())),
  ), [threads, state, channel, q]);
  const open = threads.find((t) => t.id === openId) ?? null;
  const needs = threads.filter((t) => t.state === 'needs_you').length;

  const select = (id: string) => { setOpenId(id); setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread: 0 } : t))); };
  const send = () => {
    const text = draft.trim(); if (!text || !open) return;
    const now = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    setThreads((ts) => ts.map((t) => (t.id === open.id ? { ...t, messages: [...t.messages, { id: `o${t.messages.length + 1}`, from: 'owner', text, time: now }] } : t)));
    setDraft('');
  };
  const resolve = () => open && setThreads((ts) => ts.map((t) => (t.id === open.id ? { ...t, state: 'resolved' } : t)));
  const Icon = (c: Channel) => (c === 'WhatsApp' ? MessageCircle : Instagram);

  return (
    <div className="crm-card grid h-[calc(100vh-14rem)] min-h-[560px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[22rem_1fr]">
      <div className={cn('flex min-h-0 flex-col border-white/80 lg:border-r', open && 'hidden lg:flex')}>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between"><h2 className="t-h3">Conversations</h2>{needs > 0 && <StatusBadge tone="danger">{needs} need you</StatusBadge>}</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or handle" aria-label="Search conversations"
              className="h-10 w-full rounded-full border border-white/90 bg-white/80 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Channel">
            {CHANNELS.map(([k, l]) => <button key={k} aria-pressed={channel === k} onClick={() => setChannel(k)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', channel === k ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{l}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="State">
            {STATES.map(([k, l]) => <button key={k} aria-pressed={state === k} onClick={() => setState(k)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold', state === k ? 'bg-ink/90 text-white' : 'bg-secondary text-muted-foreground hover:text-ink')}>{l}</button>)}
          </div>
        </div>
        <ul className="crm-scroll min-h-0 flex-1 overflow-y-auto">
          {list.map((t) => { const I = Icon(t.channel); return (
            <li key={t.id}>
              <button onClick={() => select(t.id)} aria-current={t.id === openId} className={cn('flex w-full items-start gap-3 border-b border-white/60 px-4 py-3 text-left transition-colors hover:bg-white/60', t.id === openId && 'bg-white/80')}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><I className="h-4 w-4" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className={cn('truncate text-sm', t.unread ? 'font-bold text-ink' : 'font-semibold text-ink')}>{t.name}</span><span className="t-small shrink-0 text-muted-foreground">{t.time}</span></span>
                  <span className="t-small block truncate text-muted-foreground">{t.last}</span>
                  <span className="mt-1 flex items-center gap-1.5"><StatusBadge tone={STATE_BADGE[t.state][0]}>{STATE_BADGE[t.state][1]}</StatusBadge>{t.unread > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{t.unread}</span>}</span>
                </span>
              </button>
            </li>); })}
          {list.length === 0 && <li className="px-4 py-12 text-center text-sm text-muted-foreground">No conversations match.</li>}
        </ul>
      </div>

      <div className={cn('flex min-h-0 flex-col', !open && 'hidden lg:flex')}>
        {!open ? (
          <div className="m-auto text-center text-muted-foreground"><MessageCircle className="mx-auto mb-2 h-8 w-8" aria-hidden /><p className="t-body">Pick a conversation to read it.</p></div>
        ) : (<>
          <div className="flex items-center gap-3 border-b border-white/80 p-4">
            <button onClick={() => setOpenId(null)} aria-label="Back to conversations" className="rounded-full p-1.5 hover:bg-white/70 lg:hidden"><ChevronLeft className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-ink">{open.name}</p><p className="t-small text-muted-foreground">{open.channel} · {open.handle}</p></div>
            {open.state !== 'resolved' && <button onClick={resolve} className={btn.outline + ' !h-8 !px-3.5 !text-[12px]'}>Mark resolved</button>}
          </div>
          <div className="crm-scroll flex-1 space-y-3 overflow-y-auto p-4">
            {open.messages.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'customer' ? 'justify-start' : 'justify-end')}>
                <div className={cn('max-w-[80%] rounded-3xl px-4 py-2.5 text-sm', m.from === 'customer' ? 'bg-white text-ink' : m.from === 'ai' ? 'bg-secondary text-ink' : 'bg-primary text-white')}>
                  {m.from === 'ai' && <span className="t-micro mb-0.5 flex items-center gap-1 text-muted-foreground"><Bot className="h-3 w-3" aria-hidden />AI</span>}
                  {m.text}<span className="t-small mt-1 block opacity-60">{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/80 p-3">
            <div className="flex gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Reply as the owner" aria-label="Reply"
                className="h-11 flex-1 rounded-full border border-white/90 bg-white/80 px-4 text-sm focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
              <button onClick={send} aria-label="Send reply" className={cn(btn.brand, '!w-11 !px-0')}><Send className="h-4 w-4" aria-hidden /></button>
            </div>
            <p className="t-small mt-1.5 text-muted-foreground">Simulated. Nothing is sent to WhatsApp or Instagram.</p>
          </div>
        </>)}
      </div>
    </div>
  );
}
