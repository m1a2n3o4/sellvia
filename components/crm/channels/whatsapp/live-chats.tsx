'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Bot, ChevronLeft, Phone, Search, Send, UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { btn } from '../../button-styles';
import { LiveDot } from './live-dot';
import type { ChatTag, WaChat } from '@/lib/crm/mock/whatsapp';

type Day = 'all' | 'today' | 'yesterday' | 'earlier';
type Filter = 'all' | 'wants_you' | 'complaint' | 'order' | 'blocked';
const DAYS: [Day, string][] = [['today', 'Today'], ['yesterday', 'Yesterday'], ['earlier', 'Earlier'], ['all', 'All days']];
const FILTERS: [Filter, string][] = [['all', 'All'], ['wants_you', 'Needs you'], ['complaint', 'Complaints'], ['order', 'Orders'], ['blocked', 'Blocked']];
const TAG_LABEL: Record<ChatTag, { text: string; cls: string }> = {
  complaint: { text: 'Complaint', cls: 'bg-danger text-white' },
  wants_you: { text: 'Wants you', cls: 'bg-brand text-ink' },
  order: { text: 'Order', cls: 'bg-success/10 text-success' },
  ai_handled: { text: 'AI handled', cls: 'bg-secondary text-ink' },
};

export function WhatsAppLiveChats({ chats, setChats, selectedId, setSelectedId }: {
  chats: WaChat[]; setChats: React.Dispatch<React.SetStateAction<WaChat[]>>; selectedId: string | null; setSelectedId: (id: string | null) => void;
}) {
  const [q, setQ] = useState('');
  const [day, setDay] = useState<Day>('today');
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState('');
  const [aiPaused, setAiPaused] = useState<Record<string, boolean>>({});
  const [confirmBlock, setConfirmBlock] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/\s/g, '');
    return chats.filter((c) => {
      if (term && !`${c.name}${c.phone}`.toLowerCase().replace(/\s/g, '').includes(term)) return false;
      if (day !== 'all' && c.day !== day && !term) return false;
      if (filter === 'blocked') return c.blocked;
      if (filter !== 'all' && !c.tags.includes(filter as ChatTag)) return false;
      return true;
    });
  }, [chats, q, day, filter]);

  const chat = chats.find((c) => c.id === selectedId) ?? null;
  // A chat opened from the overview must be visible in the list: widen filters if needed.
  useEffect(() => {
    if (selectedId && !list.some((c) => c.id === selectedId)) { setDay('all'); setFilter('all'); setQ(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [selectedId, chat?.messages.length]);
  useEffect(() => { if (selectedId) setChats((cs) => cs.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c))); }, [selectedId, setChats]);

  const send = () => {
    const text = draft.trim();
    if (!text || !chat || chat.blocked) return;
    const now = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    setChats((cs) => cs.map((c) => (c.id === chat.id ? { ...c, messages: [...c.messages, { id: `o${c.messages.length + 1}`, from: 'owner', text, time: now }] } : c)));
    setAiPaused((m) => ({ ...m, [chat.id]: true }));
    setDraft('');
  };
  const setBlocked = (blocked: boolean) => { if (chat) setChats((cs) => cs.map((c) => (c.id === chat.id ? { ...c, blocked } : c))); setConfirmBlock(false); };

  return (
    <div className="crm-card grid h-[calc(100vh-15rem)] min-h-[560px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[22rem_1fr]">
      {/* Conversation list */}
      <div className={cn('flex min-h-0 flex-col border-white/80 lg:border-r', chat && 'hidden lg:flex')}>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between"><h2 className="t-h3">Live chats</h2><LiveDot /></div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" aria-label="Search chats"
              className="h-10 w-full rounded-full border border-white/90 bg-white/80 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Day">
            {DAYS.map(([k, l]) => <button key={k} aria-pressed={day === k} onClick={() => setDay(k)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold transition-all', day === k ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:bg-white hover:text-ink')}>{l}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
            {FILTERS.map(([k, l]) => <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn('rounded-full px-3 py-1 text-[12px] font-semibold transition-all', filter === k ? 'bg-ink/90 text-white' : 'bg-secondary text-muted-foreground hover:text-ink')}>{l}</button>)}
          </div>
        </div>
        <ul className="crm-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {list.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No chats match.</li>}
          {list.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <button onClick={() => setSelectedId(c.id)} aria-current={selectedId === c.id}
                  className={cn('flex w-full items-start gap-3 rounded-[22px] p-3 text-left transition-all', selectedId === c.id ? 'bg-primary text-white shadow-[0_12px_24px_-12px_rgba(11,12,17,0.7)]' : 'hover:bg-white/80')}>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold', selectedId === c.id ? 'bg-white/15 text-white' : 'bg-secondary text-ink')}>{c.name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{c.name}</span><span className={cn('shrink-0 text-[11px]', selectedId === c.id ? 'text-white/60' : 'text-muted-foreground')}>{c.lastTime}</span></span>
                    <span className={cn('mt-0.5 block truncate text-xs', selectedId === c.id ? 'text-white/70' : 'text-muted-foreground')}>{last.from === 'ai' ? 'AI: ' : last.from === 'owner' ? 'You: ' : ''}{last.text}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
                      {c.blocked && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">Blocked</span>}
                      {c.tags.filter((t) => t !== 'ai_handled').map((t) => <span key={t} className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', TAG_LABEL[t].cls)}>{TAG_LABEL[t].text}</span>)}
                      {c.unread > 0 && <span className="ml-auto rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Thread */}
      <div className={cn('flex min-h-0 flex-col bg-white/40', !chat && 'hidden lg:flex')}>
        {!chat ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary"><UserRound className="h-6 w-6 text-brand" aria-hidden /></span><h3 className="t-h3 mt-4">Pick a chat</h3><p className="t-body mt-1 max-w-xs text-muted-foreground">See what customers wrote and what your AI replied, live.</p></div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-white/80 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setSelectedId(null)} className="rounded-full p-1.5 hover:bg-white lg:hidden" aria-label="Back to chats"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">{chat.name.charAt(0)}</span>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{chat.name}</p><p className="num text-xs text-muted-foreground">{chat.phone}</p></div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={`tel:${chat.phone.replace(/\s/g, '')}`} className={cn(btn.outline, '!h-9 !px-3')} aria-label={`Call ${chat.name}`}><Phone className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Call</span></a>
                {chat.blocked
                  ? <button onClick={() => setBlocked(false)} className={cn(btn.navy, '!h-9 !px-3')}>Unblock</button>
                  : <button onClick={() => setConfirmBlock(true)} className={cn(btn.outline, '!h-9 !px-3 text-danger')}><Ban className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Block</span></button>}
              </div>
            </div>

            <div className="crm-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-label={`Chat with ${chat.name}`}>
              {chat.blocked && <p className="rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold text-white">This customer is blocked. They cannot message you and the AI will not reply.</p>}
              {chat.messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.from === 'customer' ? 'justify-start' : 'justify-end')}>
                  <div className={cn('max-w-[80%] rounded-[22px] px-4 py-2.5 text-sm shadow-[var(--shadow-rest)]', msg.from === 'customer' ? 'rounded-bl-md bg-white text-ink' : msg.from === 'ai' ? 'rounded-br-md bg-primary text-white' : 'rounded-br-md bg-brand text-ink')}>
                    {msg.from !== 'customer' && <p className={cn('mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider', msg.from === 'ai' ? 'text-brand' : 'text-ink/60')}>{msg.from === 'ai' ? <><Bot className="h-3 w-3" aria-hidden />SatyaSell AI</> : 'You'}</p>}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={cn('mt-1 text-right text-[10px]', msg.from === 'ai' ? 'text-white/50' : 'text-muted-foreground')}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="border-t border-white/80 p-3">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground"><Bot className="h-3.5 w-3.5" aria-hidden />{aiPaused[chat.id] ? 'You took over. AI is paused for this chat.' : 'AI is replying to this customer. Send a message to take over.'}
                {aiPaused[chat.id] && <button onClick={() => setAiPaused((m) => ({ ...m, [chat.id]: false }))} className="font-bold text-ink hover:underline">Resume AI</button>}</p>
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={chat.blocked} placeholder={chat.blocked ? 'Unblock to reply' : 'Type a reply (simulated, not sent to WhatsApp)'} aria-label="Reply"
                  className="h-11 flex-1 rounded-full border border-white/90 bg-white/90 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)] disabled:opacity-50" />
                <button type="submit" disabled={chat.blocked || !draft.trim()} className={cn(btn.navy, '!h-11 !w-11 !px-0')} aria-label="Send"><Send className="h-4 w-4 text-brand" aria-hidden /></button>
              </form>
            </div>
          </>
        )}
      </div>

      <Dialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Block {chat?.name}?</DialogTitle>
            <DialogDescription>They will not be able to message your business and the AI will stop replying. You can unblock them anytime.</DialogDescription>
          </DialogHeader>
          <p className="rounded-2xl bg-brand/20 px-3 py-2 text-xs text-ink">Simulated: this only changes what you see here. Nothing is blocked on a real WhatsApp number yet.</p>
          <DialogFooter className="gap-2">
            <button className={btn.outline} onClick={() => setConfirmBlock(false)}>Cancel</button>
            <button className={cn(btn.navy, '!bg-danger hover:!bg-danger/90')} onClick={() => setBlocked(true)}>Block customer</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
