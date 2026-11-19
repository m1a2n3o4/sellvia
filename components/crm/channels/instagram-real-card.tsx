'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Inbox, Instagram, Lock, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { btn } from '../button-styles';
import { StatusBadge } from '../status-badge';

export interface RealStatus { connected: boolean; username?: string | null; connectedAt?: string; messages?: number }

/** The real Instagram connection of the logged-in business. Reports its state upward (null = not logged in). */
export function InstagramRealCard({ onState }: { onState?: (s: RealStatus | null) => void }) {
  const [s, setS] = useState<RealStatus | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/instagram/status', { cache: 'no-store' });
      const v = r.ok ? ((await r.json()) as RealStatus) : null;
      setS(v); onState?.(v);
    } catch { setS(null); onState?.(null); }
  }, [onState]);
  useEffect(() => { load(); }, [load]);

  const disconnect = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/instagram/disconnect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deleteMessages: wipe }) });
      if (!r.ok) throw new Error();
      setOpen(false); setWipe(false); await load();
    } catch { setErr('Could not disconnect. Please try again.'); }
    setBusy(false);
  };

  if (s === undefined) return <div className="crm-card h-32 animate-pulse" aria-hidden />;
  if (s === null) return null; // not logged in (local preview): the sample page below is shown instead

  return (
    <section className="crm-card p-6" aria-labelledby="ig-real">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#833ab4] via-[#e1306c] to-[#f77737] text-white"><Instagram className="h-5 w-5" aria-hidden /></span>
          <div>
            <h2 id="ig-real" className="t-h3">Instagram connection</h2>
            {s.connected ? (
              <p className="t-body mt-0.5 flex flex-wrap items-center gap-2"><StatusBadge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />Connected</StatusBadge>
                <span className="font-semibold text-ink">{s.username ? `@${s.username}` : 'Instagram account'}</span>
                {s.connectedAt && <span className="text-muted-foreground">since {new Date(s.connectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}</p>
            ) : <p className="t-body mt-0.5 text-muted-foreground">Not connected. Connect your Instagram business account to receive and answer customer messages in your Inbox.</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {s.connected ? (<>
            <Link href="/app/inbox" className={btn.brand}><Inbox className="h-4 w-4" aria-hidden />Open Inbox</Link>
            <button onClick={() => setOpen(true)} className={btn.outline}>Disconnect</button>
          </>) : <a href="/auth/instagram/start" className={btn.brand}><Instagram className="h-4 w-4" aria-hidden />Connect Instagram</a>}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="crm-soft rounded-2xl p-4">
          <p className="t-label mb-1.5">What SatyaSell uses</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />Your Instagram account name and ID</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />Messages customers send to your account</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />Replies you send from your Inbox (within 24 hours)</li>
          </ul>
        </div>
        <div className="crm-soft rounded-2xl p-4">
          <p className="t-label mb-1.5">Your control</p>
          <p className="text-sm text-muted-foreground"><Lock className="mr-1 inline h-4 w-4" aria-hidden />You can disconnect at any time. Disconnecting removes our access token and we stop saving new messages. {s.connected && typeof s.messages === 'number' ? `${s.messages} stored message(s) can also be deleted.` : ''}</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Instagram?</DialogTitle>
            <DialogDescription>SatyaSell will stop receiving messages from {s.username ? `@${s.username}` : 'this account'} and you will not be able to reply from the Inbox until you connect again.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Our access token is deleted immediately.</li>
            <li>We stop saving new messages from Instagram.</li>
          </ul>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-4 w-4" checked={wipe} onChange={(e) => setWipe(e.target.checked)} />
            <span>Also permanently delete the {s.messages ?? 0} stored message(s) from SatyaSell. This cannot be undone.</span></label>
          {err && <p role="alert" className="rounded-2xl bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger">{err}</p>}
          <DialogFooter className="gap-2">
            <button className={btn.outline} onClick={() => setOpen(false)}>Cancel</button>
            <button className={btn.brand} onClick={disconnect} disabled={busy}>{busy ? 'Disconnecting…' : 'Disconnect'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
