'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Rocket, RotateCcw, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import { impactOf, validateConfig } from '@/lib/crm/config/taxonomy/validate-config';
import { Chip, Modal, inputCls, btn, Label } from '@/components/studio/ui';

export default function ReleasePage() {
  const { draft, live, releases, dirty, publish, discard, restore } = useStudio();
  const [label, setLabel] = useState('');
  const [done, setDone] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<'discard' | number | null>(null);
  const issues = useMemo(() => validateConfig(draft), [draft]);
  const impact = useMemo(() => impactOf(live.snapshot, draft), [live, draft]);
  const errors = issues.filter((i) => i.level === 'error'); const warnings = issues.filter((i) => i.level === 'warning');
  const breaking = impact.filter((i) => i.removed.length || i.newlyRequired.length);

  return (
    <div className="space-y-6">
      <PageHeader title="Publish & versions" description="Drafts never affect businesses. Check the release, then publish. Each release is saved so you can go back."
        eyebrow={<Chip tone={dirty ? 'brand' : 'success'}>{dirty ? 'Draft differs from live' : `Draft matches live v${live.version}`}</Chip>} />
      {done && <div role="status" className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />Release v{done} is live. New and existing businesses use it from now on (simulated in this prototype).</div>}

      <section className="crm-card p-5"><h2 className="t-h3 mb-3">1. Checks</h2>
        {errors.length === 0 ? <p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />No errors. Every active business type produces a valid form.</p>
          : <ul className="space-y-1.5">{errors.map((e, i) => <li key={i} className="flex gap-2 text-sm font-semibold text-danger"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{e.message}</li>)}</ul>}
        {warnings.length > 0 && <ul className="mt-3 space-y-1.5">{warnings.slice(0, 8).map((w, i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />{w.message}</li>)}{warnings.length > 8 && <li className="t-small text-muted-foreground">and {warnings.length - 8} more warnings</li>}</ul>}</section>

      <section className="crm-card p-5"><h2 className="t-h3 mb-1">2. What changes for businesses</h2>
        <p className="t-small mb-3 text-muted-foreground">Compared with the live release. Removed fields are hidden for new entries; saved data is never deleted.</p>
        {impact.length === 0 ? <p className="text-sm text-muted-foreground">No form changes yet.</p> : (
          <div className="crm-scroll overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead><tr className="t-micro text-left text-muted-foreground"><th className="py-2">Business type</th><th>Added</th><th>Removed</th><th>Now required</th></tr></thead>
            <tbody>{impact.map((i) => <tr key={i.typeId} className="border-t border-white/80 align-top"><td className="py-2.5 font-semibold">{i.typeName}</td><td className="t-small">{i.added.join(', ') || '—'}</td><td className="t-small">{i.removed.join(', ') || '—'}</td><td className="t-small">{i.newlyRequired.join(', ') || '—'}</td></tr>)}</tbody></table></div>)}
        {breaking.length > 0 && <p className="mt-3 flex gap-2 rounded-2xl bg-brand/20 px-4 py-3 text-sm font-semibold"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{breaking.length} business type{breaking.length > 1 ? 's have' : ' has'} removed or newly required fields. Existing products keep their values; owners are asked to fill new required fields when they next edit.</p>}</section>

      <section className="crm-card p-5"><h2 className="t-h3 mb-3">3. Publish</h2>
        <div className="max-w-md"><Label htmlFor="rl">Release note</Label><input id="rl" className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Added batch number to pickles" /></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={btn.brand} disabled={!dirty || errors.length > 0} onClick={() => { const r = publish(label); setDone(r.version); setLabel(''); }}><Rocket className="h-4 w-4" />Publish v{live.version + 1}</button>
          <button className={btn.outline} disabled={!dirty} onClick={() => setConfirm('discard')}>Discard draft changes</button></div>
        {errors.length > 0 && <p className="t-small mt-2 text-danger">Fix the errors above to publish.</p>}</section>

      <section className="crm-card p-5"><h2 className="t-h3 mb-3 flex items-center gap-2"><History className="h-5 w-5" aria-hidden />Versions</h2>
        <ul className="divide-y divide-white/80">{[...releases].reverse().map((r) => (
          <li key={r.version} className="flex flex-wrap items-center gap-3 py-3"><Chip tone={r.version === live.version ? 'success' : 'neutral'}>v{r.version}{r.version === live.version ? ' · live' : ''}</Chip>
            <span className="min-w-0 flex-1"><span className="font-semibold text-ink">{r.label}</span><span className="t-small block text-muted-foreground">{new Date(r.publishedAt).toLocaleString('en-IN')}</span></span>
            {r.version !== live.version && <button className={btn.small + ' border border-white/90 bg-white/80'} onClick={() => setConfirm(r.version)}><RotateCcw className="h-3.5 w-3.5" />Load into draft</button>}</li>))}</ul></section>

      {confirm !== null && (
        <Modal title={confirm === 'discard' ? 'Discard draft changes?' : `Load v${confirm} into the draft?`} onClose={() => setConfirm(null)}>
          <p className="t-body text-muted-foreground">{confirm === 'discard' ? 'Your unpublished edits will be lost. The live release is not affected.' : 'This replaces your current draft. Nothing goes live until you publish again.'}</p>
          <div className="mt-5 flex justify-end gap-2"><button className={btn.outline} onClick={() => setConfirm(null)}>Cancel</button>
            <button className={btn.brand} onClick={() => { if (confirm === 'discard') discard(); else restore(confirm); setConfirm(null); setDone(null); }}>Confirm</button></div></Modal>)}
    </div>
  );
}
