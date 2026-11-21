'use client';

// Dashboard for a real owner: only real facts, never the sample telemetry.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Instagram, Package, Pencil } from 'lucide-react';
import { btn } from '../button-styles';
import { useCrm } from '../crm-context';
import { PageHeader } from '../page-header';

export function RealDashboard() {
  const { workspace, user, config, nav } = useCrm();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => { fetch('/api/app/products', { cache: 'no-store' }).then((r) => r.json()).then((j) => setCount(Array.isArray(j.products) ? j.products.length : 0)).catch(() => setCount(null)); }, []);
  const types = (workspace.businessTypes ?? []).map((id) => config.taxonomy.find((n) => n.id === id)?.name ?? id);
  const hasProducts = nav.some((s) => s.items.some((i) => i.key === 'products'));
  const steps = [
    { icon: Package, done: (count ?? 0) > 0, title: hasProducts ? 'Add your first product' : 'Set up your catalogue', body: 'The form is built for your business type.', href: '/app/catalogue/products/new', cta: 'Add product', show: hasProducts },
    { icon: Instagram, done: false, title: 'Connect Instagram', body: 'See customer messages in your inbox and reply.', href: '/app/channels/instagram', cta: 'Connect', show: true },
    { icon: Pencil, done: true, title: 'Business type chosen', body: types.join(', '), href: '/app/onboarding', cta: 'Change', show: true },
  ].filter((s) => s.show);
  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} description={`${workspace.name}${types.length ? ` · ${types.join(', ')}` : ''}`} />
      <div className="crm-stagger grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="crm-card flex flex-col p-5">
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${s.done ? 'bg-success/10 text-success' : 'bg-primary text-brand'}`}>{s.done ? <Check className="h-5 w-5" aria-hidden /> : <s.icon className="h-5 w-5" aria-hidden />}</span>
            <h2 className="t-h3 !text-[17px]">{s.title}</h2><p className="t-body mt-1 flex-1 text-muted-foreground">{s.body}</p>
            <Link href={s.href} className={`${s.done ? btn.outline : btn.brand} mt-4 self-start`}>{s.cta}</Link>
          </div>))}
      </div>
      <div className="crm-card p-5"><p className="t-label">Products saved</p><p className="t-h1 mt-1">{count ?? '–'}</p>
        <p className="t-small mt-2 text-muted-foreground">Orders, customers and analytics will appear here as those modules go live. Nothing on this page is sample data.</p></div>
    </div>
  );
}
