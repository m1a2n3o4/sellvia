'use client';

import Link from 'next/link';
import { Boxes, FileCog, ListTree, Rocket, ScanSearch, Smartphone, Instagram, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import { Chip, btn } from '@/components/studio/ui';

export default function StudioHome() {
  const { draft, live, dirty, ready } = useStudio();
  const types = draft.taxonomy.filter((n) => n.level === 3 && n.active);
  const stat = [
    { label: 'Industries', v: draft.taxonomy.filter((n) => n.level === 1 && n.active).length },
    { label: 'Categories', v: draft.taxonomy.filter((n) => n.level === 2 && n.active).length },
    { label: 'Business types', v: types.length },
    { label: 'Fields in library', v: draft.fields.filter((f) => f.active).length },
  ];
  const uses = [
    { icon: Instagram, title: '1. Instagram onboarding', body: 'Owner connects Instagram. We read the profile name and bio, recognise the business type, and set up their menu, forms and fields. The owner confirms before anything is applied.', note: 'Live once Meta approves; simulated until then.' },
    { icon: Smartphone, title: '2. Manual: "Choose your business"', body: 'Owner types the business name and what they sell. We suggest types from the same recognition rules; they pick one and see their menu and forms.', note: 'Works without Instagram.' },
    { icon: Settings2, title: '3. You, any time', body: 'Add categories, fields, options and variants here, check the impact, then publish a release. New and existing businesses pick up the latest release.', note: 'Drafts never affect clients.' },
  ];
  return (
    <div className="space-y-8">
      <PageHeader title="Business Studio" description="One configuration decides what every kind of business sees: its menu, forms and fields. Change it here, publish when ready."
        eyebrow={ready ? <Chip tone={dirty ? 'brand' : 'success'}>{dirty ? 'Unpublished changes' : `Live release v${live.version}`}</Chip> : undefined}
        actions={<Link href="/superadmin/studio/release" className={btn.brand}><Rocket className="h-4 w-4" />Publish & versions</Link>} />

      <div className="crm-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat.map((s) => <div key={s.label} className="crm-card p-5"><p className="t-micro text-muted-foreground">{s.label}</p><p className="num mt-2 text-[34px] font-bold leading-none tracking-tight text-ink">{s.v}</p></div>)}
      </div>

      <section aria-labelledby="uses"><h2 id="uses" className="t-h3 mb-3">Where this configuration is used</h2>
        <div className="crm-stagger grid gap-4 lg:grid-cols-3">
          {uses.map((u) => (
            <div key={u.title} className="crm-card p-5"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-brand"><u.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="t-h3 !text-[17px]">{u.title}</h3><p className="t-body mt-1.5 text-muted-foreground">{u.body}</p><p className="t-small mt-3 font-semibold text-ink">{u.note}</p></div>))}
        </div></section>

      <section aria-labelledby="go"><h2 id="go" className="t-h3 mb-3">Work on</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: 'categories', icon: ListTree, t: 'Categories', d: 'Industry, category, business type, keywords.' },
            { href: 'business-types', icon: Boxes, t: 'Business types', d: 'Fields, variants, menu and a live form preview.' },
            { href: 'fields', icon: FileCog, t: 'Field library', d: 'Create and edit reusable fields.' },
            { href: 'recognition', icon: ScanSearch, t: 'Recognition test', d: 'Try a bio or name and see what we detect.' },
          ].map((c) => (
            <Link key={c.href} href={`/superadmin/studio/${c.href}`} className="crm-card crm-card-hover flex items-start gap-3 p-5"><c.icon className="mt-0.5 h-5 w-5 text-ink" aria-hidden />
              <span><span className="t-h3 block !text-[16px]">{c.t}</span><span className="t-small text-muted-foreground">{c.d}</span></span></Link>))}
        </div></section>
      <p className="t-small text-muted-foreground">Prototype note: drafts and releases are saved in this browser only. The shared, database-backed version comes with the backend stage.</p>
    </div>
  );
}
