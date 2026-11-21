'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, EyeOff, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import { ancestorChain, flatFields, resolveFormSchema } from '@/lib/crm/config/taxonomy/resolve-form';
import { TEMPLATES } from '@/lib/crm/config/templates';
import type { ResolvedField, VariantAxis } from '@/lib/crm/config/taxonomy/types';
import { FieldEditor, ADMIN_TYPES } from '@/components/studio/field-editor';
import { FormPreview } from '@/components/studio/form-preview';
import { MenuEditor } from '@/components/studio/menu-editor';
import { resolveMenu } from '@/lib/crm/config/taxonomy/menu';
import { Chip, Switch, SOURCE_TONE, inputCls, btn, slugify, Label } from '@/components/studio/ui';

type Tab = 'fields' | 'variants' | 'preview' | 'menu';

function Detail({ id }: { id: string }) {
  const { draft, upsertMapping, removeMapping, setAxes } = useStudio();
  const [tab, setTab] = useState<Tab>('fields');
  const [creating, setCreating] = useState(false);
  const [pick, setPick] = useState(''); const [scope, setScope] = useState<'subcategory' | 'category'>('subcategory'); const [req, setReq] = useState(false); const [section, setSection] = useState('Details');

  const node = draft.taxonomy.find((n) => n.id === id)!;
  const chain = useMemo(() => { try { return ancestorChain(id, draft); } catch { return []; } }, [id, draft]);
  const category = chain.find((c) => c.level === 2);
  const schema = useMemo(() => { try { return resolveFormSchema(id, draft); } catch (e) { return { error: (e as Error).message } as const; } }, [id, draft]);
  if ('error' in schema) return <div role="alert" className="crm-card p-5 text-sm font-semibold text-danger">{schema.error}</div>;

  const fields = flatFields(schema);
  const present = new Set(fields.map((f) => f.id));
  const hidden = draft.mappings.filter((m) => m.scope === 'subcategory' && m.scopeId === id && m.enabled === false);
  const library = draft.fields.filter((f) => f.active && !present.has(f.id));
  const orderOf = (f: ResolvedField) => f.order;

  const setRequired = (f: ResolvedField, v: boolean) => upsertMapping({ fieldId: f.id, scope: 'subcategory', scopeId: id, required: v });
  const hide = (f: ResolvedField) => {
    const own = draft.mappings.find((m) => m.fieldId === f.id && m.scope === 'subcategory' && m.scopeId === id);
    const inherited = draft.mappings.some((m) => m.fieldId === f.id && (m.scope === 'global' || (m.scope === 'category' && chain.some((c) => c.id === m.scopeId))));
    if (own && !inherited) removeMapping(f.id, 'subcategory', id); else upsertMapping({ fieldId: f.id, scope: 'subcategory', scopeId: id, enabled: false });
  };
  const move = (f: ResolvedField, sec: ResolvedField[], dir: -1 | 1) => {
    const i = sec.findIndex((x) => x.id === f.id); const nb = sec[i + dir]; if (!nb) return;
    upsertMapping({ fieldId: f.id, scope: 'subcategory', scopeId: id, order: dir < 0 ? orderOf(nb) - 0.01 : orderOf(nb) + 0.01 });
  };
  const add = (fieldId: string) => {
    if (!fieldId) return;
    const scopeId = scope === 'category' && category ? category.id : id;
    upsertMapping({ fieldId, scope: scope === 'category' && category ? 'category' : 'subcategory', scopeId, required: req, section: section.trim() || 'Details' });
    // a re-add must also clear a previous "hidden" mapping on this type
    if (scope === 'category') removeMapping(fieldId, 'subcategory', id);
    setPick(''); setReq(false);
  };

  const ownAxes = draft.axes[id]; const effective = schema.variants.axes;
  const axesFrom = [...chain].reverse().find((c) => draft.axes[c.id])?.name;
  const editAxis = (i: number, a: Partial<VariantAxis>) => setAxes(id, effective.map((x, j) => (j === i ? { ...x, ...a } : x)));
  const optsText = (a: VariantAxis) => a.options.map((o) => o.label).join(', ');
  const parseOpts = (t: string, prev: VariantAxis['options']) => t.split(',').map((x) => x.trim()).filter(Boolean).map((label) => ({ label, value: prev.find((p) => p.label === label)?.value ?? slugify(label).replace(/_/g, '-') }));

  const templates = node.defaultTemplates;

  return (
    <div className="space-y-4">
      <div className="crm-card p-5">
        <p className="t-small text-muted-foreground">{chain.map((c) => c.name).join('  ›  ')}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="t-h2">{node.name}</h2>{!node.active && <Chip tone="danger">Inactive</Chip>}</div>
        <p className="t-small mt-1 text-muted-foreground">Templates: {templates.map((t) => TEMPLATES[t]?.name).join(', ') || 'none (standard menu)'} · {fields.length} fields · {effective.length} variant options · {resolveMenu([id], draft).reduce((n, x) => n + x.items.length, 0)} menu items</p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist">
          {([['fields', 'Fields'], ['variants', 'Variants'], ['preview', 'Form preview'], ['menu', 'Menu']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-full px-4 py-2 text-[13px] font-semibold', tab === k ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70 hover:text-ink')}>{l}</button>))}
        </div>
      </div>

      {tab === 'fields' && (<>
        {schema.sections.map((sec) => (
          <section key={sec.name} className="crm-card p-4 sm:p-5"><h3 className="t-h3 mb-2 !text-[16px]">{sec.name}</h3>
            <ul className="divide-y divide-white/80">{sec.fields.map((f, i) => (
              <li key={f.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="min-w-[10rem] flex-1"><span className="font-semibold text-ink">{f.label}</span><span className="t-small block text-muted-foreground">{f.key}</span></span>
                <Chip tone={SOURCE_TONE[f.source]}>{f.source === 'global' ? 'Everyone' : f.source === 'category' ? `Category` : 'This type'}</Chip>
                <Chip>{ADMIN_TYPES.find((t) => t.value === f.type)?.label ?? 'Images'}</Chip>
                <label className="flex items-center gap-2 text-xs font-semibold"><Switch on={f.required} onChange={(v) => setRequired(f, v)} label={`${f.label} required`} />Required</label>
                <button aria-label={`Move ${f.label} up`} disabled={i === 0} onClick={() => move(f, sec.fields, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white disabled:opacity-35"><ArrowUp className="h-4 w-4" /></button>
                <button aria-label={`Move ${f.label} down`} disabled={i === sec.fields.length - 1} onClick={() => move(f, sec.fields, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white disabled:opacity-35"><ArrowDown className="h-4 w-4" /></button>
                {f.isSystem ? <span className="w-8" /> : <button aria-label={`Hide ${f.label} for this type`} title="Hide for this business type" onClick={() => hide(f)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white">{f.source === 'subcategory' ? <Trash2 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>}
              </li>))}</ul></section>))}

        {hidden.length > 0 && <section className="crm-card p-4 sm:p-5"><h3 className="t-h3 mb-2 !text-[16px]">Hidden for this type</h3>
          <ul className="flex flex-wrap gap-2">{hidden.map((m) => { const fd = draft.fields.find((x) => x.id === m.fieldId); return fd ? (
            <li key={m.fieldId}><button onClick={() => removeMapping(m.fieldId, 'subcategory', id)} className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-[13px] font-semibold hover:bg-white"><RotateCcw className="h-3.5 w-3.5" />Restore {fd.label}</button></li>) : null; })}</ul></section>}

        <section className="crm-card p-4 sm:p-5"><h3 className="t-h3 mb-3 !text-[16px]">Add a field</h3>
          <div className="grid gap-3 md:grid-cols-[1fr_12rem_10rem]">
            <div><Label htmlFor="ad-f">Field</Label><select id="ad-f" className={inputCls} value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Choose from library</option>{library.map((f) => <option key={f.id} value={f.id}>{f.label} ({f.key})</option>)}</select></div>
            <div><Label htmlFor="ad-s">Section</Label><input id="ad-s" className={inputCls} value={section} onChange={(e) => setSection(e.target.value)} list="sections" /><datalist id="sections">{schema.sections.map((s) => <option key={s.name} value={s.name} />)}</datalist></div>
            <div><Label htmlFor="ad-sc">Applies to</Label><select id="ad-sc" className={inputCls} value={scope} onChange={(e) => setScope(e.target.value as 'subcategory' | 'category')}><option value="subcategory">This type only</option>{category && <option value="category">All of {category.name}</option>}</select></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm font-semibold"><Switch on={req} onChange={setReq} label="Required" />Required</label>
            <button disabled={!pick} onClick={() => add(pick)} className={btn.brand}><Plus className="h-4 w-4" />Add to form</button>
            <button onClick={() => setCreating(true)} className={btn.outline}>Create a new field…</button></div>
        </section></>)}

      {tab === 'variants' && (
        <section className="crm-card p-5"><h3 className="t-h3 !text-[16px]">Variant options</h3>
          <p className="t-small mb-3 text-muted-foreground">Things a buyer chooses that change price or stock (size, colour, pack size). {ownAxes ? 'Set for this business type.' : axesFrom ? `Inherited from ${axesFrom}.` : 'None defined.'}</p>
          {effective.map((a, i) => (
            <div key={a.key} className="mb-3 grid gap-2 md:grid-cols-[12rem_1fr_auto]">
              <input aria-label="Option name" className={inputCls} value={a.label} onChange={(e) => editAxis(i, { label: e.target.value })} />
              <input aria-label={`${a.label} values`} className={inputCls} defaultValue={optsText(a)} onBlur={(e) => editAxis(i, { options: parseOpts(e.target.value, a.options) })} placeholder="S, M, L" />
              <button aria-label={`Remove ${a.label}`} onClick={() => setAxes(id, effective.filter((_, j) => j !== i))} className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary hover:bg-white"><Trash2 className="h-4 w-4" /></button>
            </div>))}
          <div className="mt-2 flex flex-wrap gap-2">
            <button className={btn.outline} onClick={() => setAxes(id, [...effective, { key: `option_${effective.length + 1}`, label: 'New option', options: [{ value: 'a', label: 'A' }] }])}><Plus className="h-4 w-4" />Add option</button>
            {ownAxes && <button className={btn.ghost} onClick={() => setAxes(id, null)}>Use inherited</button>}
          </div>
          <p className="t-small mt-3 text-muted-foreground">Separate values with commas, then click away to apply.</p></section>)}

      {tab === 'preview' && <div className="crm-card p-5"><FormPreview key={JSON.stringify(schema.sections.map((s) => s.fields.map((f) => f.id + f.required)))} schema={schema} /></div>}

      {tab === 'menu' && <MenuEditor nodeId={id} />}

      {creating && <FieldEditor onClose={() => setCreating(false)} onSaved={(f) => setPick(f.id)} />}
    </div>
  );
}

function Inner() {
  const { draft } = useStudio();
  const sp = useSearchParams(); const router = useRouter();
  const types = draft.taxonomy.filter((n) => n.level === 3);
  const sel = sp.get('type') && types.some((t) => t.id === sp.get('type')) ? sp.get('type')! : types.find((t) => t.active)?.id ?? types[0]?.id;
  const [q, setQ] = useState('');
  const cats = draft.taxonomy.filter((n) => n.level === 2);
  return (
    <div>
      <PageHeader title="Business types" description="Choose a business type to control its fields, variants and menu. Changes stay in your draft until you publish." />
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <aside className="crm-card h-fit p-3 lg:sticky lg:top-24">
          <input aria-label="Search business types" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, 'mb-2 !h-10')} />
          <div className="crm-scroll max-h-[60vh] overflow-y-auto">{cats.map((c) => { const items = types.filter((t) => t.parentId === c.id && (!q || t.name.toLowerCase().includes(q.toLowerCase()))); return items.length ? (
            <div key={c.id} className="mb-2"><p className="t-micro px-2 pb-1 pt-2 text-muted-foreground">{c.name}</p>
              {items.map((t) => <button key={t.id} onClick={() => router.replace(`/superadmin/studio/business-types?type=${t.id}`)} aria-current={t.id === sel ? 'page' : undefined}
                className={cn('block w-full rounded-full px-3.5 py-2 text-left text-[13px] font-semibold', t.id === sel ? 'border border-primary bg-primary text-white' : 'text-ink/75 hover:bg-white', !t.active && 'opacity-50')}>{t.name}</button>)}</div>) : null; })}</div>
        </aside>
        {sel ? <Detail key={sel} id={sel} /> : <div className="crm-card p-8 text-center text-sm text-muted-foreground">No business types yet.</div>}
      </div>
    </div>
  );
}

export default function BusinessTypesPage() { return <Suspense fallback={null}><Inner /></Suspense>; }
