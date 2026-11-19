'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Instagram, Lock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../status-badge';
import { btn } from '../button-styles';

interface Conv { senderId: string; lastText: string | null; lastAt: string; lastDirection: 'in' | 'out'; windowOpen: boolean; windowExpiresAt: string | null; messageCount: number }
interface Msg { mid: string; direction: 'in' | 'out'; text: string | null; at: string }
interface Thread { messages: Msg[]; windowOpen: boolean; windowExpiresAt: string | null }

const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const left = (iso: string | null) => {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now(); if (ms <= 0) return '';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
};

/** Real Instagram DMs for the logged-in business (needs the client login cookie). */
export function InstagramLive() {
  const [convs, setConvs] = useState<Conv[] | null>(null);
  const [auth, setAuth] = useState<'ok' | 'login' | 'error'>('ok');
  const [openId, setOpenId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    try {
      const r = await fetch('/api/instagram/inbox', { cache: 'no-store' });
      if (r.status === 401) { setAuth('login'); return; }
      if (!r.ok) throw new Error();
      setConvs((await r.json()).conversations); setAuth('ok');
    } catch { setAuth('error'); }
  }, []);
  const loadThread = useCallback(async (id: string) => {
    const r = await fetch(`/api/instagram/inbox/${id}`, { cache: 'no-store' });
    if (r.ok) setThread(await r.json());
  }, []);

  useEffect(() => { loadList(); const t = setInterval(loadList, 20000); return () => clearInterval(t); }, [loadList]);
  useEffect(() => { if (!openId) { setThread(null); return; } loadThread(openId); const t = setInterval(() => loadThread(openId), 15000); return () => clearInterval(t); }, [openId, loadThread]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread?.messages.length]);

  const send = async () => {
    const text = draft.trim(); if (!text || !openId || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/instagram/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ senderId: openId, text }) });
      const j = await r.json();
      if (!j.ok) setErr(j.code === 'META_ERROR' ? `Instagram refused it: ${j.meta?.message ?? 'unknown error'} (code ${j.meta?.code ?? '?'})` : j.message ?? 'Could not send.');
      else { setDraft(''); await Promise.all([loadThread(openId), loadList()]); }
    } catch { setErr('Network problem. Try again.'); }
    setBusy(false);
  };

  if (auth === 'login') return <div className="crm-card p-8 text-center"><Lock className="mx-auto mb-2 h-7 w-7 text-muted-foreground" aria-hidden /><p className="t-body">Log in to your SatyaSell business account first, then reload this page.</p><a href="/client/login" className={cn(btn.brand, 'mt-4')}>Go to login</a></div>;
  if (auth === 'error') return <div className="crm-card p-8 text-center text-muted-foreground">Could not load Instagram messages. Try again in a moment.</div>;

  const open = thread?.windowOpen ?? false;
  return (
    <div className="crm-card grid h-[calc(100vh-17rem)] min-h-[520px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[22rem_1fr]">
      <div className={cn('flex min-h-0 flex-col border-white/80 lg:border-r', openId && 'hidden lg:flex')}>
        <div className="flex items-center justify-between p-4"><h2 className="t-h3">Instagram DMs</h2><StatusBadge tone="success">Live</StatusBadge></div>
        <ul className="crm-scroll min-h-0 flex-1 overflow-y-auto">
          {convs === null && <li className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</li>}
          {convs?.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No Instagram messages yet. Send a DM to the connected account to see it here.</li>}
          {convs?.map((c) => (
            <li key={c.senderId}>
              <button onClick={() => { setOpenId(c.senderId); setErr(null); }} className={cn('flex w-full items-start gap-3 border-b border-white/60 px-4 py-3 text-left hover:bg-white/60', c.senderId === openId && 'bg-white/80')}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><Instagram className="h-4 w-4" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-ink">Customer …{c.senderId.slice(-4)}</span><span className="t-small shrink-0 text-muted-foreground">{when(c.lastAt)}</span></span>
                  <span className="t-small block truncate text-muted-foreground">{c.lastDirection === 'out' ? 'You: ' : ''}{c.lastText}</span>
                  <span className="mt-1 block"><StatusBadge tone={c.windowOpen ? 'success' : 'neutral'}>{c.windowOpen ? `Reply open · ${left(c.windowExpiresAt)} left` : 'Reply window closed'}</StatusBadge></span>
                </span>
              </button>
            </li>))}
        </ul>
      </div>

      <div className={cn('flex min-h-0 flex-col', !openId && 'hidden lg:flex')}>
        {!openId ? <div className="m-auto text-center text-muted-foreground"><Instagram className="mx-auto mb-2 h-8 w-8" aria-hidden /><p className="t-body">Pick a conversation.</p></div> : (<>
          <div className="flex items-center gap-3 border-b border-white/80 p-4">
            <button onClick={() => setOpenId(null)} className="rounded-full px-2 py-1 text-sm hover:bg-white/70 lg:hidden" aria-label="Back">←</button>
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-ink">Customer …{openId.slice(-4)}</p><p className="t-small text-muted-foreground">Instagram · ID {openId}</p></div>
          </div>
          <div className="crm-scroll flex-1 space-y-3 overflow-y-auto p-4">
            {thread?.messages.map((m) => (
              <div key={m.mid} className={cn('flex', m.direction === 'in' ? 'justify-start' : 'justify-end')}>
                <div className={cn('max-w-[80%] rounded-3xl px-4 py-2.5 text-sm', m.direction === 'in' ? 'bg-white text-ink' : 'bg-primary text-white')}>{m.text}<span className="t-small mt-1 block opacity-60">{when(m.at)}</span></div>
              </div>))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-white/80 p-3">
            {!open ? (
              <p role="status" className="rounded-2xl bg-secondary px-4 py-3 text-sm text-ink"><Lock className="mr-1.5 inline h-4 w-4" aria-hidden />The 24-hour reply window has closed. Instagram only lets you reply within 24 hours of the customer&apos;s last message. You can reply again when they message you.</p>
            ) : (<>
              {err && <p role="alert" className="mb-2 rounded-2xl bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger">{err}</p>}
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} maxLength={1000} placeholder="Reply on Instagram" aria-label="Reply"
                  className="h-11 flex-1 rounded-full border border-white/90 bg-white/80 px-4 text-sm focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]" />
                <button onClick={send} disabled={busy || !draft.trim()} aria-label="Send reply" className={cn(btn.brand, '!w-11 !px-0')}><Send className="h-4 w-4" aria-hidden /></button>
              </div>
              <p className="t-small mt-1.5 text-muted-foreground">Sends a real Instagram message. You can reply for {left(thread?.windowExpiresAt ?? null)} more.</p>
            </>)}
          </div>
        </>)}
      </div>
    </div>
  );
}
