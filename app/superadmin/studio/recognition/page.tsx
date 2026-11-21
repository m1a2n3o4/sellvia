'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import { recogniseBusiness } from '@/lib/crm/config/taxonomy/recognise';
import { flatFields, resolveFormSchema, SEED } from '@/lib/crm/config/taxonomy/resolve-form';
import { getVisibleNav } from '@/lib/crm/nav';
import { Chip, inputCls, Label } from '@/components/studio/ui';

const SAMPLES = [
  { name: "Amma's Pickles", text: 'Homemade mango pickle, avakaya and gongura. Handmade in small batches. Order on WhatsApp.' },
  { name: 'Sweet Crumbs', text: 'Custom birthday cakes, cupcakes and brownies. Baked fresh in Jubilee Hills.' },
  { name: 'Sunrise Retreat', text: 'Beach resort with villas, a restaurant and wedding events.' },
  { name: 'Urban Threads', text: "Men's wear and ladies kurtis. New arrivals every week." },
  { name: 'Zeta', text: 'We help people. DM for details.' },
];

export default function RecognitionPage() {
  const { draft, live } = useStudio();
  const [src, setSrc] = useState<'draft' | 'live'>('draft');
  const [name, setName] = useState(SAMPLES[0].name); const [text, setText] = useState(SAMPLES[0].text);
  const cfg = src === 'draft' ? draft : live.snapshot;
  const r = useMemo(() => recogniseBusiness({ name, text }, cfg), [name, text, cfg]);
  const top = r.suggestions[0];
  const preview = useMemo(() => {
    if (!top) return null;
    try {
      const node = cfg.taxonomy.find((n) => n.id === top.nodeId)!;
      return { fields: flatFields(resolveFormSchema(top.nodeId, cfg)).length, nav: getVisibleNav(node.defaultTemplates).flatMap((s) => s.items.map((i) => i.label)), templates: node.defaultTemplates };
    } catch { return null; }
  }, [top, cfg]);
  void SEED;

  return (
    <div>
      <PageHeader title="Recognition test" description="See what the platform detects from a business name and bio. The same rules power Instagram onboarding and the manual 'Choose your business' step." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="crm-card p-5">
          <div className="mb-3 flex gap-1.5" role="group" aria-label="Configuration to test">{(['draft', 'live'] as const).map((k) => <button key={k} aria-pressed={src === k} onClick={() => setSrc(k)} className={cn('rounded-full px-4 py-1.5 text-[13px] font-semibold', src === k ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70')}>{k === 'draft' ? 'My draft' : `Live v${live.version}`}</button>)}</div>
          <div className="space-y-3"><div><Label htmlFor="rn">Business name (or Instagram name)</Label><input id="rn" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label htmlFor="rb">Bio or what they sell</Label><textarea id="rb" rows={4} className={cn(inputCls, 'h-auto py-3')} value={text} onChange={(e) => setText(e.target.value)} /></div></div>
          <p className="t-micro mb-1.5 mt-4 text-muted-foreground">Samples</p>
          <div className="flex flex-wrap gap-1.5">{SAMPLES.map((s) => <button key={s.name} onClick={() => { setName(s.name); setText(s.text); }} className="rounded-full bg-secondary px-3.5 py-1.5 text-[13px] font-semibold hover:bg-white">{s.name}</button>)}</div>
        </section>

        <section className="crm-card p-5" aria-live="polite">
          <div className="mb-3 flex items-center gap-2">
            {r.decision === 'confident' && <Chip tone="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Confident</Chip>}
            {r.decision === 'ask' && <Chip tone="brand"><HelpCircle className="mr-1 h-3.5 w-3.5" />Ask the owner</Chip>}
            {r.decision === 'none' && <Chip tone="danger"><SearchX className="mr-1 h-3.5 w-3.5" />No match</Chip>}
            <span className="t-small text-muted-foreground">{r.note}</span></div>
          <ol className="space-y-2">{r.suggestions.map((s, i) => (
            <li key={s.nodeId} className={cn('rounded-2xl border p-3', i === 0 && r.decision === 'confident' ? 'border-primary/30 bg-white' : 'border-white/90 bg-white/60')}>
              <p className="font-semibold text-ink">{s.name} <span className="t-small font-normal text-muted-foreground">score {s.score}</span></p>
              <p className="t-small text-muted-foreground">{s.path.join('  ›  ')}</p>
              <p className="t-small mt-1">Matched: {s.matched.map((m) => <Chip key={m}>{m}</Chip>).reduce<React.ReactNode[]>((a, c, k) => [...a, k ? ' ' : '', c], [])}</p></li>))}</ol>
          {preview && top && <div className="mt-4 rounded-2xl bg-secondary p-4"><p className="t-label">If the owner picks {top.name}</p>
            <p className="t-small mt-1 text-muted-foreground">{preview.fields} product fields · templates: {preview.templates.join(', ') || 'standard'}</p>
            <p className="t-small mt-1 text-muted-foreground">Menu: {preview.nav.join(' · ')}</p></div>}
          <p className="t-small mt-4 text-muted-foreground">The platform never applies a business type silently: the owner always confirms.</p>
        </section>
      </div>
    </div>
  );
}
