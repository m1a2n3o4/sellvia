'use client';

// Owner onboarding (Stage T3, SIMULATED). Two paths feed the SAME recognition and the SAME configuration:
//  1. Instagram: reads profile name + bio. Real reading needs Meta approval, so sample profiles are used for now.
//  2. Manual "Choose your business": name + what they sell.
// The owner always confirms. Nothing is stored; the backend stage saves the chosen business type on the tenant.
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, Instagram, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { PageHeader } from '../page-header';
import { inputCls } from '../dynamic/dynamic-field';
import { FormPreview } from '@/components/studio/form-preview';
import { recogniseBusiness } from '@/lib/crm/config/taxonomy/recognise';
import { flatFields, resolveFormSchema, SEED } from '@/lib/crm/config/taxonomy/resolve-form';
import { resolveMenu, templatesFor } from '@/lib/crm/config/taxonomy/menu';
import { loadLiveConfig } from '@/lib/studio/live-config';

const SAMPLES = [
  { handle: '@amma.pickles', name: "Amma's Pickles", bio: 'Homemade mango pickle, avakaya and gongura. Small batches. Order on WhatsApp.' },
  { handle: '@sweetcrumbs.hyd', name: 'Sweet Crumbs', bio: 'Custom birthday cakes, cupcakes and brownies. Baked fresh.' },
  { handle: '@sunrise.retreat', name: 'Sunrise Retreat', bio: 'Beach resort with villas, a restaurant and wedding events.' },
  { handle: '@zeta.co', name: 'Zeta', bio: 'We help people. DM for details.' },
];

type Step = 'path' | 'details' | 'confirm' | 'ready';

export function OnboardingFlow() {
  const [{ cfg, version }, setLive] = useState({ cfg: SEED, version: 1 });
  useEffect(() => setLive(loadLiveConfig()), []);
  const [step, setStep] = useState<Step>('path');
  const [path, setPath] = useState<'instagram' | 'manual'>('manual');
  const [name, setName] = useState(''); const [text, setText] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [browse, setBrowse] = useState(false);

  const rec = useMemo(() => recogniseBusiness({ name, text }, cfg), [name, text, cfg]);
  const types = cfg.taxonomy.filter((n) => n.level === 3 && n.active);
  const primary = picked[0];
  const ready = useMemo(() => {
    if (!primary) return null;
    try {
      const node = cfg.taxonomy.find((n) => n.id === primary)!;
      const templates = templatesFor(picked, cfg);
      return { schema: resolveFormSchema(primary, cfg), templates, nav: resolveMenu(picked, cfg), node };
    } catch { return null; }
  }, [primary, picked, cfg]);

  const run = () => { setPicked(rec.decision === 'confident' ? [rec.suggestions[0].nodeId] : []); setBrowse(rec.decision === 'none'); setStep('confirm'); };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Set up your business" description="Tell us what you do and we will prepare your menu, product forms and fields. You confirm before anything is applied."
        eyebrow={<span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold">Simulated · configuration v{version}</span>} />

      {step === 'path' && (
        <div className="crm-stagger grid gap-4 md:grid-cols-2">
          <button onClick={() => { setPath('instagram'); setStep('details'); }} className="crm-card crm-card-hover p-6 text-left"><Instagram className="mb-3 h-7 w-7" aria-hidden /><h2 className="t-h3">Onboard with Instagram</h2><p className="t-body mt-1 text-muted-foreground">We read your Instagram name and bio and recognise your business automatically.</p><p className="t-small mt-3 font-semibold">Real Instagram reading starts after Meta approval. For now, try a sample profile.</p></button>
          <button onClick={() => { setPath('manual'); setStep('details'); }} className="crm-card crm-card-hover p-6 text-left"><Store className="mb-3 h-7 w-7" aria-hidden /><h2 className="t-h3">Choose your business</h2><p className="t-body mt-1 text-muted-foreground">No Instagram? Enter your business name and what you sell. We suggest the best match.</p></button>
        </div>)}

      {step === 'details' && (
        <section className="crm-card p-6">
          <button onClick={() => setStep('path')} className="t-small mb-3 inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-ink"><ChevronLeft className="h-4 w-4" />Back</button>
          {path === 'instagram' && <><p className="t-label mb-2">Sample Instagram profiles</p>
            <div className="mb-4 flex flex-wrap gap-1.5">{SAMPLES.map((s) => <button key={s.handle} onClick={() => { setName(s.name); setText(s.bio); }} className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold', name === s.name ? 'border border-primary bg-primary text-white' : 'bg-secondary hover:bg-white')}>{s.handle}</button>)}</div></>}
          <div className="space-y-3">
            <div><label htmlFor="ob-n" className="t-label mb-1.5 block">{path === 'instagram' ? 'Profile name' : 'Business name'}</label><input id="ob-n" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label htmlFor="ob-t" className="t-label mb-1.5 block">{path === 'instagram' ? 'Bio' : 'What do you sell or offer?'}</label><textarea id="ob-t" rows={3} className={cn(inputCls, 'h-auto py-3')} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. homemade pickles, custom cakes, beach resort rooms" /></div>
          </div>
          <div className="mt-5 flex justify-end"><button disabled={!name.trim() && !text.trim()} onClick={run} className={btn.brand}>Find my business type</button></div>
        </section>)}

      {step === 'confirm' && (
        <section className="crm-card p-6" aria-live="polite">
          <button onClick={() => setStep('details')} className="t-small mb-3 inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-ink"><ChevronLeft className="h-4 w-4" />Back</button>
          <h2 className="t-h3">{rec.decision === 'confident' ? 'We think you are:' : rec.decision === 'ask' ? 'A few could fit. Which are you?' : 'We could not tell. Please choose.'}</h2>
          <p className="t-small mb-3 text-muted-foreground">{rec.decision === 'confident' ? 'Please confirm, or change it.' : 'You can pick more than one if you run several things (for example a resort and a restaurant).'}</p>
          <ul className="space-y-2">{rec.suggestions.map((s) => { const on = picked.includes(s.nodeId); return (
            <li key={s.nodeId}><button onClick={() => toggle(s.nodeId)} aria-pressed={on} className={cn('w-full rounded-2xl border p-3 text-left', on ? 'border-primary bg-white' : 'border-white/90 bg-white/60 hover:bg-white')}><span className="font-semibold">{s.name}</span><span className="t-small block text-muted-foreground">{s.path.join('  ›  ')}</span></button></li>); })}</ul>
          <button onClick={() => setBrowse((b) => !b)} className="t-small mt-3 font-semibold underline">{browse ? 'Hide full list' : 'None of these? Browse all business types'}</button>
          {browse && <div className="crm-scroll mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">{types.map((t) => <button key={t.id} aria-pressed={picked.includes(t.id)} onClick={() => toggle(t.id)} className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold', picked.includes(t.id) ? 'border border-primary bg-primary text-white' : 'bg-secondary hover:bg-white')}>{t.name}</button>)}</div>}
          <div className="mt-5 flex justify-end"><button disabled={!picked.length} onClick={() => setStep('ready')} className={btn.brand}>Confirm and set up</button></div>
        </section>)}

      {step === 'ready' && ready && (
        <div className="space-y-4">
          <section className="crm-card p-6 text-center"><CheckCircle2 className="mx-auto mb-2 h-9 w-9 text-success" aria-hidden /><h2 className="t-h2">{name || 'Your business'} is set up</h2>
            <p className="t-body mt-1 text-muted-foreground">As {picked.map((id) => cfg.taxonomy.find((n) => n.id === id)?.name).join(' + ')}. Simulated: nothing was saved.</p></section>
          <section className="crm-card p-5"><h3 className="t-h3 mb-3 !text-[16px]">Your menu</h3>
            <div className="grid gap-4 sm:grid-cols-2">{ready.nav.map((s) => <div key={s.key}><p className="t-micro mb-1.5 text-muted-foreground">{s.label}</p><ul className="space-y-1">{s.items.map((i) => <li key={i.key} className="flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2 text-sm font-semibold"><i.icon className="h-4 w-4 text-ink/60" aria-hidden />{i.label}</li>)}</ul></div>)}</div></section>
          <section className="crm-card p-5"><h3 className="t-h3 mb-1 !text-[16px]">Your product form ({flatFields(ready.schema).length} fields)</h3><p className="t-small mb-3 text-muted-foreground">Try it:</p><FormPreview schema={ready.schema} /></section>
          <div className="flex justify-end gap-2"><button onClick={() => { setStep('path'); setPicked([]); setName(''); setText(''); }} className={btn.outline}>Start over</button><Link href="/app" className={btn.brand}>Go to dashboard</Link></div>
        </div>)}
    </div>
  );
}
