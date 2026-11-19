'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Ban, BadgeCheck, CheckCircle2, CircleDot, Gem, Link2, Link2Off, MessageCircle, PackageX, PlusCircle, Settings2, Sparkles, Film, Image as ImageIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { PageHeader } from '../page-header';
import { inr, type InvStatus, type IgPost, type MOCK_IG } from '@/lib/crm/mock/instagram';

type Profile = typeof MOCK_IG;
type DialogState = { kind: 'comments' | 'dms' | 'orders'; postId: string } | null;
const OFFLINE = 'Available once Instagram is connected to a real account';
const STATUS: Record<InvStatus, { label: string; dot: string; chip: string }> = {
  live: { label: 'Live', dot: 'bg-success', chip: 'bg-success/10 text-success' },
  stopped: { label: 'Orders stopped', dot: 'bg-[#785a00]', chip: 'bg-brand/20 text-[#5a4300]' },
  out_of_stock: { label: 'Out of stock', dot: 'bg-danger', chip: 'bg-danger/10 text-danger' },
};
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function InstagramConnected({ profile, posts }: { profile: Profile; posts: IgPost[] }) {
  const [status, setStatus] = useState<Record<string, InvStatus>>(() => Object.fromEntries(posts.map((p) => [p.id, p.product.status])));
  const [posted, setPosted] = useState<Record<string, Set<string>>>({});       // comment ids replied this session
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({}); // drafted replies, not yet posted
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState('');

  const repliedOf = (p: IgPost) => p.commentsReplied + (posted[p.id]?.size ?? 0);

  const totals = useMemo(() => {
    const t = { comments: 0, replied: 0, dms: 0, wa: 0, web: 0, ordered: 0, stopped: 0, revenue: 0 };
    for (const p of posts) {
      t.comments += p.commentsTotal; t.replied += repliedOf(p); t.dms += p.dms; t.wa += p.waOpens; t.web += p.webOpens;
      t.ordered += p.ordered; t.stopped += p.stopped; t.revenue += p.revenue;
    }
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, posted]);
  const opens = totals.wa + totals.web;
  const post = dialog ? posts.find((p) => p.id === dialog.postId) ?? null : null;

  const setInv = (p: IgPost, s: InvStatus) => {
    setStatus((m) => ({ ...m, [p.id]: s }));
    setNotice(`${p.product.name}: ${STATUS[s].label.toLowerCase()} (simulated, nothing changed in a real store)`);
  };

  const draftReplies = (p: IgPost) => {
    const d: Record<string, string> = {};
    for (const c of p.comments) if (!c.replied && !posted[p.id]?.has(c.id)) {
      d[c.id] = `Hi ${c.user.split(/[._]/)[0]}! Thanks for asking about ${p.product.name}. We've sent the details and an order link to your DM.`;
    }
    setDrafts((m) => ({ ...m, [p.id]: d }));
  };
  const postReplies = (p: IgPost) => {
    const ids = Object.keys(drafts[p.id] ?? {});
    setPosted((m) => ({ ...m, [p.id]: new Set([...(m[p.id] ?? []), ...ids]) }));
    setDrafts((m) => ({ ...m, [p.id]: {} }));
    setNotice(`${ids.length} replies marked as posted (simulated, nothing was sent to Instagram)`);
  };

  const kpi = 'crm-card crm-card-hover p-4';
  const funnel = [
    { label: 'Comments', value: totals.comments, sub: `${totals.replied} replied by AI` },
    { label: 'Private DMs sent', value: totals.dms, sub: `${pct(totals.dms, totals.comments)}% of comments` },
    { label: 'Order links opened', value: opens, sub: `${pct(opens, totals.dms)}% of DMs` },
    { label: 'Orders placed', value: totals.ordered, sub: `${pct(totals.ordered, opens)}% of opens` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instagram"
        description="Everything your reels and posts earned: comments, AI replies, DMs, link opens, orders and money, on one page."
        actions={
          <>
            <button className={btn.outline} disabled title={OFFLINE}><Link2Off className="h-4 w-4" aria-hidden />Disconnect</button>
            <Link href="/app/channels/instagram/settings" className={btn.outline}><Settings2 className="h-4 w-4" aria-hidden />Settings</Link>
            <Link href="/app/channels/instagram/create" className={btn.brand}><PlusCircle className="h-4 w-4" aria-hidden />Create Post</Link>
          </>
        }
      />

      {/* Instagram-style profile */}
      <section className="crm-card p-5 sm:p-7" aria-label="Instagram profile">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-10">
          <div className="flex items-center gap-5 sm:block">
            <div className="shrink-0 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[3px]">
              <div className="rounded-full bg-white p-[3px]">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-brand sm:h-32 sm:w-32"><Gem className="h-9 w-9 sm:h-14 sm:w-14" aria-hidden /></span>
              </div>
            </div>
            <dl className="flex flex-1 justify-around text-center sm:hidden">
              {[[profile.postsCount, 'posts'], [profile.followers, 'followers'], [profile.following, 'following']].map(([v, l]) => (
                <div key={l}><dd className="num text-base font-bold text-ink">{v}</dd><dt className="text-xs text-muted-foreground">{l}</dt></div>
              ))}
            </dl>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-ink">{profile.handle}{profile.verified && <BadgeCheck className="h-5 w-5 fill-[#0095f6] text-white" aria-label="Verified" />}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-ink"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#785a00]" /></span>Simulated connection</span>
            </div>
            <dl className="mt-4 hidden gap-8 sm:flex">
              {[[profile.postsCount, 'posts'], [profile.followers, 'followers'], [profile.following, 'following']].map(([v, l]) => (
                <div key={l} className="flex items-baseline gap-1.5"><dd className="num text-base font-bold text-ink">{v}</dd><dt className="text-base text-ink">{l}</dt></div>
              ))}
            </dl>
            <div className="mt-4 space-y-0.5 text-sm">
              <p className="font-bold text-ink">{profile.name}</p>
              <p className="text-muted-foreground">{profile.category}</p>
              {profile.bio.map((line) => <p key={line} className="text-ink">{line}</p>)}
              <p className="flex items-center gap-1 pt-0.5 font-semibold text-[#00376b]"><Link2 className="h-3.5 w-3.5" aria-hidden />{profile.link}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mini dashboard */}
      <section aria-label="Instagram summary" className="crm-stagger grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="col-span-2 rounded-[28px] bg-navy p-4 text-white shadow-[var(--shadow-rest)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a5c8ff]">Money generated by reels & posts</p>
          <p className="num mt-2 text-3xl font-bold tracking-tight text-brand">{inr(totals.revenue)}</p>
          <p className="mt-1 text-xs text-[#a5c8ff]">from {totals.ordered} orders across {posts.length} reels & posts</p>
        </div>
        <div className={kpi}><p className="t-micro text-muted-foreground">Reels & posts</p><p className="t-h2 num mt-2">{posts.length}</p><p className="t-small text-muted-foreground">{posts.filter((p) => p.kind === 'Reel').length} reels, {posts.filter((p) => p.kind === 'Post').length} posts</p></div>
        <div className={kpi}><p className="t-micro text-muted-foreground">Comments replied</p><p className="t-h2 num mt-2">{totals.replied}<span className="text-base font-medium text-muted-foreground">/{totals.comments}</span></p><p className="t-small text-success">{pct(totals.replied, totals.comments)}% by AI employee</p></div>
        <div className={kpi}><p className="t-micro text-muted-foreground">Private DMs</p><p className="t-h2 num mt-2">{totals.dms}</p><p className="t-small text-muted-foreground">with order links</p></div>
        <div className={kpi}><p className="t-micro text-muted-foreground">Link opens</p><p className="t-h2 num mt-2 !text-success">{opens}</p><p className="t-small text-muted-foreground">WA {totals.wa} • Web {totals.web}</p></div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="crm-card p-5 lg:col-span-2">
          <h2 className="t-h3">From comment to order</h2>
          <p className="t-small mt-0.5 text-muted-foreground">How people move through your AI-handled conversations.</p>
          <ol className="mt-4 space-y-3">
            {funnel.map((f, i) => (
              <li key={f.label}>
                <div className="mb-1 flex items-baseline justify-between text-sm"><span className="font-medium text-ink">{f.label}</span><span><span className="num font-bold text-ink">{f.value}</span> <span className="text-xs text-muted-foreground">{f.sub}</span></span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#eff4ff]"><div className={cn('crm-fill h-full rounded-full', i === 3 ? 'bg-success' : i === 0 ? 'bg-navy' : 'bg-[#396093]')} style={{ width: `${Math.max(4, pct(f.value, funnel[0].value))}%`, animationDelay: `${i * 80}ms` }} /></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="crm-card p-5">
          <h2 className="t-h3">Why people stopped</h2>
          <p className="t-small mt-0.5 text-muted-foreground">{totals.stopped} stopped after enquiry. Top reasons:</p>
          <ul className="mt-4 space-y-3">
            {profile.stopReasons.map((r) => (
              <li key={r.label}>
                <div className="flex justify-between text-xs"><span className="text-ink">{r.label}</span><span className="num font-bold text-ink">{r.n}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eff4ff]"><div className="crm-fill h-full rounded-full bg-brand" style={{ width: `${pct(r.n, profile.stopReasons[0].n)}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Table */}
      <section className="crm-card overflow-hidden" aria-labelledby="posts-title">
        <div className="border-b border-muted p-5">
          <h2 id="posts-title" className="t-h3">Reels & posts, one by one</h2>
          <p className="t-small mt-0.5 text-muted-foreground">Scroll sideways for every column. Use the actions on the right to control the linked product.</p>
          <p role="status" aria-live="polite" className={cn('mt-2 text-xs font-medium text-navy transition-opacity', notice ? 'opacity-100' : 'opacity-0')}>{notice || ' '}</p>
        </div>
        <div className="crm-scroll overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-muted-foreground">
                {['S.no', 'Reel / Post', 'Comments', 'Replies', "DM's", 'Link opens', 'Actually ordered', 'Stopped after enquiry', 'Money generated', 'List of orders', 'Inventory status', 'Action'].map((h, i) => (
                  <th key={h} scope="col" className={cn('t-micro whitespace-nowrap px-4 py-3', i === 0 && 'sticky left-0 z-10 w-[3.5rem] bg-[#f8fafc]', i === 1 && 'sticky left-[3.5rem] z-10 bg-[#f8fafc] shadow-[1px_0_0_0_#e2e8f0]')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {posts.map((p, idx) => {
                const st = status[p.id]; const s = STATUS[st]; const replied = repliedOf(p);
                return (
                  <tr key={p.id} className="group align-top transition-colors hover:bg-[#f8fafc]">
                    <td className="num sticky left-0 z-10 w-[3.5rem] bg-white px-4 py-4 font-semibold text-muted-foreground group-hover:bg-[#f8fafc]">{idx + 1}</td>
                    <td className="sticky left-[3.5rem] z-10 min-w-[15rem] bg-white px-4 py-4 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-[#f8fafc]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#1d3556] to-navy-deep text-brand/80">{p.kind === 'Reel' ? <Film className="h-4 w-4" aria-hidden /> : <ImageIcon className="h-4 w-4" aria-hidden />}</span>
                        <div className="min-w-0">
                          <p className="max-w-[11rem] truncate font-semibold text-navy">{p.title}</p>
                          <p className="max-w-[11rem] truncate text-xs text-muted-foreground">{p.caption}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground"><span className="rounded-full bg-secondary px-1.5 py-0.5 font-semibold text-navy">{p.kind}</span> • Posted {p.postedOn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><p className="num font-semibold text-ink">{p.commentsTotal} comments</p><button onClick={() => setDialog({ kind: 'comments', postId: p.id })} className="mt-1 text-xs font-semibold text-navy hover:underline">View comments</button></td>
                    <td className="min-w-[8.5rem] px-4 py-4">
                      <p className="num font-semibold text-ink">{replied}/{p.commentsTotal} replied</p>
                      <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-[#dce9ff]"><div className={cn('h-full rounded-full transition-all', replied === p.commentsTotal ? 'bg-success' : 'bg-brand')} style={{ width: `${pct(replied, p.commentsTotal)}%` }} /></div>
                    </td>
                    <td className="px-4 py-4"><p className="num font-semibold text-ink">{p.dms} sent</p><button onClick={() => setDialog({ kind: 'dms', postId: p.id })} className="mt-1 text-xs font-semibold text-navy hover:underline">See what AI sent</button></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn('inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', p.waOpens ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}><MessageCircle className="h-3 w-3" aria-hidden />WhatsApp: {p.waOpens}</span>
                        <span className={cn('inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', p.webOpens ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}><CircleDot className="h-3 w-3" aria-hidden />Web: {p.webOpens}</span>
                      </div>
                    </td>
                    <td className="num px-4 py-4 font-bold text-success">{p.ordered}</td>
                    <td className="px-4 py-4"><p className="num font-bold text-[#785a00]">{p.stopped}</p><p className="mt-0.5 max-w-[10rem] text-[11px] text-muted-foreground">Mostly: {p.topStopReason}</p></td>
                    <td className="num px-4 py-4 font-bold text-navy">{inr(p.revenue)}</td>
                    <td className="px-4 py-4"><button onClick={() => setDialog({ kind: 'orders', postId: p.id })} className="text-xs font-semibold text-navy hover:underline">{p.orders.length} orders, view list</button></td>
                    <td className="min-w-[10rem] px-4 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold', s.chip)}><span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />{s.label}</span>
                      <p className="mt-1 text-[11px] text-muted-foreground">{p.product.sku} • <span className="num">{p.product.stock}</span> in stock</p>
                    </td>
                    <td className="px-4 py-4">
                      <div role="group" aria-label={`Inventory actions for ${p.title}`} className="inline-flex rounded-full bg-secondary p-0.5">
                        {([['live', 'Live', CheckCircle2], ['stopped', 'Stop order', Ban], ['out_of_stock', 'Out of stock', PackageX]] as const).map(([k, label, Icon]) => (
                          <button key={k} aria-pressed={st === k} onClick={() => setInv(p, k)} title={label}
                            className={cn('flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold transition-all', st === k ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy')}>
                            <Icon className="h-3 w-3" aria-hidden />{label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail dialogs */}
      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {post && dialog?.kind === 'comments' && (() => {
            const d = drafts[post.id] ?? {}; const hasDrafts = Object.keys(d).length > 0;
            const unreplied = post.comments.filter((c) => !c.replied && !posted[post.id]?.has(c.id));
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Comments on “{post.title}”</DialogTitle>
                  <DialogDescription><span className="num font-semibold text-ink">{repliedOf(post)}/{post.commentsTotal}</span> comments replied. Showing the latest {post.comments.length}.</DialogDescription>
                </DialogHeader>
                <ul className="space-y-3">
                  {post.comments.map((c) => {
                    const isReplied = c.replied || posted[post.id]?.has(c.id);
                    const text = c.reply ?? d[c.id] ?? (posted[post.id]?.has(c.id) ? '(reply posted)' : undefined);
                    return (
                      <li key={c.id} className="rounded-2xl border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm"><span className="font-semibold text-ink">@{c.user}</span> <span className="text-muted-foreground">{c.text}</span></p>
                          <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold', isReplied ? 'bg-success/10 text-success' : 'bg-brand/20 text-[#5a4300]')}>{isReplied ? 'Replied' : d[c.id] ? 'Draft ready' : 'Not replied'}</span>
                        </div>
                        {text && <p className="mt-2 rounded-full bg-secondary px-3 py-2 text-xs text-navy"><Sparkles className="mr-1 inline h-3 w-3 text-brand" aria-hidden />{text}</p>}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                  <p className="text-xs text-muted-foreground">Replies here are simulated. Nothing is sent to Instagram.</p>
                  {hasDrafts
                    ? <button className={btn.brand} onClick={() => postReplies(post)}>Post {Object.keys(d).length} replies</button>
                    : <button className={btn.navy} disabled={unreplied.length === 0} onClick={() => draftReplies(post)}><Sparkles className="h-4 w-4 text-brand" aria-hidden />Auto-reply with relevant info</button>}
                </div>
              </>
            );
          })()}

          {post && dialog?.kind === 'dms' && (
            <>
              <DialogHeader>
                <DialogTitle>What the AI sent: “{post.title}”</DialogTitle>
                <DialogDescription>{post.dms} private DMs with product details and an order link. Sample of recent conversations.</DialogDescription>
              </DialogHeader>
              <ul className="space-y-3">
                {post.journeys.map((j) => (
                  <li key={j.id} className="rounded-2xl border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">{j.customer} <span className="text-xs font-normal text-muted-foreground">• {j.sentAt}</span></p>
                      <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', j.opened ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{j.opened ? `${j.link} link opened` : 'Link not opened'}</span>
                    </div>
                    <p className="mt-2 rounded-full bg-secondary px-3 py-2 text-xs text-navy">{j.aiMessage}</p>
                    <p className="mt-2 text-xs">
                      {j.outcome === 'ordered' && <span className="font-semibold text-success">Ordered</span>}
                      {j.outcome === 'pending' && <span className="text-muted-foreground">Waiting. No action yet.</span>}
                      {j.outcome === 'stopped' && <span className="text-[#785a00]"><span className="font-semibold">Stopped {j.stoppedAt?.toLowerCase()}.</span> Reason: {j.reason}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {post && dialog?.kind === 'orders' && (
            <>
              <DialogHeader>
                <DialogTitle>Orders from “{post.title}”</DialogTitle>
                <DialogDescription><span className="num font-semibold text-ink">{inr(post.revenue)}</span> from {post.orders.length} orders.</DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="text-muted-foreground">{['Order', 'Customer', 'Amount', 'Via', 'Status'].map((h) => <th key={h} className="t-micro py-2 pr-4">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-muted">
                    {post.orders.map((o) => (
                      <tr key={o.id}>
                        <td className="num py-2.5 pr-4 font-medium text-navy">{o.id}</td><td className="py-2.5 pr-4">{o.customer}</td>
                        <td className="num py-2.5 pr-4 font-semibold text-ink">{o.amount}</td><td className="py-2.5 pr-4">{o.channel}</td>
                        <td className="py-2.5"><span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', o.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-brand/20 text-[#5a4300]')}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

