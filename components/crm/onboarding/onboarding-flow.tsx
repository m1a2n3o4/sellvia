'use client';

// "Choose your business": the owner types, we suggest, they pick, see what they can do, and submit.
// Submit saves their business type(s) (server for real owners) and reloads so the menu and forms update.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Instagram, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { PageHeader } from '../page-header';
import { inputCls } from '../dynamic/dynamic-field';
import { useCrm } from '../crm-context';
import { searchBusinessTypes } from '@/lib/crm/config/taxonomy/recognise';
import { capabilitiesFor } from '@/lib/crm/config/taxonomy/capabilities';
import { resolveMenu } from '@/lib/crm/config/taxonomy/menu';
import { flatFields, resolveFormSchema } from '@/lib/crm/config/taxonomy/resolve-form';

export function OnboardingFlow() {
  const { config, workspace, applyBusinessTypes, configVersion } = useCrm();
  const [name, setName] = useState(workspace.real ? workspace.name : '');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<string[]>(workspace.businessTypes ?? []);
  const [active, setActive] = useState(0);
  const [openList, setOpenList] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(false);
  const box = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchBusinessTypes(q, config, 6).filter((h) => !picked.includes(h.nodeId)), [q, config, picked]);
  useEffect(() => setActive(0), [q]);
  const nodeName = (id: string) => config.taxonomy.find((n) => n.id === id)?.name ?? id;
  const path = (id: string) => { const n = config.taxonomy.find((x) => x.id === id); const p: string[] = []; let c = n; while (c) { p.unshift(c.name); c = config.taxonomy.find((x) => x.id === c!.parentId); } return p; };

  const add = (id: string) => { if (picked.length < 4) setPicked((p) => [...p, id]); setQ(''); setOpenList(false); box.current?.focus(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (!hits.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % hits.length); setOpenList(true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + hits.length) % hits.length); }
    else if (e.key === 'Enter' && openList) { e.preventDefault(); add(hits[active].nodeId); }
    else if (e.key === 'Escape') setOpenList(false);
  };

  const preview = useMemo(() => {
    if (!picked.length) return null;
    try {
      return { menu: resolveMenu(picked, config), fields: flatFields(resolveFormSchema(picked[0], config)).length,
        caps: Array.from(new Set(picked.flatMap((id) => capabilitiesFor(id, config)))).slice(0, 8) };
    } catch { return null; }
  }, [picked, config]);

  const submit = async () => {
    setBusy(true); setErr('');
    const r = await applyBusinessTypes(picked, name.trim() || undefined);
    if (!r.ok) { setBusy(false); setErr(r.error ?? 'Could not save'); return; }
    setDone(true);
    // Real owners: full reload so the server rebuilds the menu from the saved choice. Samples update in place.
    if (workspace.real) window.location.assign('/app'); else setBusy(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Choose your business" description="Type what you sell or offer. Pick the best match and we will set up your menu, forms and fields."
        eyebrow={configVersion ? <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold">Configuration v{configVersion}</span> : undefined} />

      <section className="crm-card p-5 sm:p-6">
        <label htmlFor="ob-name" className="t-label mb-1.5 block">Your business name</label>
        <input id="ob-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amma's Pickles" autoComplete="organization" />

        <label htmlFor="ob-q" className="t-label mb-1.5 mt-5 block">What do you sell or offer?</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input ref={box} id="ob-q" role="combobox" aria-expanded={openList && hits.length > 0} aria-controls="ob-list" aria-autocomplete="list" aria-activedescendant={hits[active] ? `ob-opt-${hits[active].nodeId}` : undefined}
            className={cn(inputCls, '!h-12 pl-11')} value={q} onChange={(e) => { setQ(e.target.value); setOpenList(true); }} onKeyDown={onKey} onFocus={() => setOpenList(true)} placeholder="Start typing: pickles, cakes, men's wear, resort…" autoComplete="off" />
          {openList && q.trim().length >= 2 && (
            <ul id="ob-list" role="listbox" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-3xl border border-ink/20 bg-white p-2 shadow-[var(--shadow-lift)]">
              {hits.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No match yet. Try another word (for example “cake”, “saree”, “rooms”).</li>}
              {hits.map((h, i) => (
                <li key={h.nodeId} id={`ob-opt-${h.nodeId}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); add(h.nodeId); }}
                  className={cn('cursor-pointer rounded-2xl px-4 py-2.5', i === active ? 'bg-secondary' : '')}>
                  <span className="block font-semibold text-ink">{h.name}</span>
                  <span className="t-small block text-muted-foreground">{h.path.slice(0, -1).join('  ›  ')} · matched {h.reason}</span>
                </li>))}
            </ul>)}
        </div>
        <p className="t-small mt-2 text-muted-foreground">Pick up to 4 if you run more than one kind of business (for example a resort and a restaurant).</p>

        {picked.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Chosen business types">{picked.map((id) => (
          <li key={id} className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary py-1.5 pl-4 pr-2 text-[13px] font-semibold text-white">
            <span>{nodeName(id)}<span className="ml-1.5 text-white/60">{path(id).slice(0, -1).join(' › ')}</span></span>
            <button aria-label={`Remove ${nodeName(id)}`} onClick={() => setPicked(picked.filter((x) => x !== id))} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 hover:bg-white/30"><X className="h-3.5 w-3.5" /></button></li>))}</ul>}
      </section>

      {preview && (
        <section className="crm-card p-5 sm:p-6" aria-live="polite">
          <h2 className="t-h3">What you can do</h2>
          <ul className="mt-3 space-y-2">{preview.caps.map((c) => <li key={c} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /><span>{c}</span></li>)}</ul>
          <h3 className="t-label mb-2 mt-5">Your menu will look like this</h3>
          <div className="grid gap-4 sm:grid-cols-2">{preview.menu.map((s) => <div key={s.key}><p className="t-micro mb-1.5 text-muted-foreground">{s.label}</p>
            <ul className="space-y-1">{s.items.map((i) => <li key={i.key} className="flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold"><i.icon className="h-4 w-4 text-ink/60" aria-hidden />{i.label}</li>)}</ul></div>)}</div>
          <p className="t-small mt-4 text-muted-foreground">Your add-product form will have {preview.fields} fields set for {nodeName(picked[0])}.</p>
        </section>)}

      {err && <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{err}</p>}
      {done && !workspace.real && <p role="status" className="rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">Done. Your menu and forms are updated (sample business: nothing is saved to the server).</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="t-small flex items-center gap-1.5 text-muted-foreground"><Instagram className="h-4 w-4" aria-hidden />Instagram auto-detect arrives after Meta approval.</span>
        <button disabled={!picked.length || busy} onClick={submit} className={`${btn.brand} !h-12 !px-8 !text-[15px]`}>{busy ? 'Setting up…' : 'Submit and set up my business'}</button>
      </div>
    </div>
  );
}
