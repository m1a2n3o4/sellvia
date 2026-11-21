'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import { TEMPLATES } from '@/lib/crm/config/templates';
import type { TaxonomyModel, TaxonomyNode } from '@/lib/crm/config/taxonomy/types';
import type { TemplateKey } from '@/lib/crm/config/types';
import { Modal, Label, Chip, Switch, inputCls, btn, kebab } from '@/components/studio/ui';

const MODELS: TaxonomyModel[] = ['product', 'service', 'booking', 'hybrid'];
const LEVEL = { 1: 'Industry', 2: 'Category', 3: 'Business type' } as const;

function NodeEditor({ node, parent, onClose }: { node?: TaxonomyNode; parent: TaxonomyNode | null; onClose: () => void }) {
  const { draft, upsertNode } = useStudio();
  const level = (node?.level ?? (parent ? parent.level + 1 : 1)) as 1 | 2 | 3;
  const [name, setName] = useState(node?.name ?? '');
  const [model, setModel] = useState<TaxonomyModel>(node?.businessModel ?? parent?.businessModel ?? 'product');
  const [tpls, setTpls] = useState<TemplateKey[]>(node?.defaultTemplates ?? []);
  const [kw, setKw] = useState((node?.keywords ?? []).join(', '));
  const [hl, setHl] = useState((node?.highlights ?? []).join('\n'));
  const [active, setActive] = useState(node?.active ?? true);
  const [err, setErr] = useState('');

  const save = () => {
    const nm = name.trim();
    if (!nm) return setErr('Give it a name.');
    if (draft.taxonomy.some((x) => x.id !== node?.id && x.parentId === (node?.parentId ?? parent?.id ?? null) && x.name.toLowerCase() === nm.toLowerCase())) return setErr('That name already exists here.');
    let id = node?.id ?? kebab(nm);
    if (!node) { let n = 2; const base = id; while (draft.taxonomy.some((x) => x.id === id)) id = `${base}-${n++}`; }
    upsertNode({ id, parentId: node?.parentId ?? parent?.id ?? null, level, name: nm, businessModel: model, defaultTemplates: tpls, keywords: kw.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean), highlights: hl.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 12), active, description: node?.description });
    onClose();
  };
  return (
    <Modal title={node ? `Edit ${LEVEL[level].toLowerCase()}` : `New ${LEVEL[level].toLowerCase()}${parent ? ` in ${parent.name}` : ''}`} onClose={onClose}>
      <div className="space-y-4">
        <div><Label htmlFor="n-name">Name</Label><input id="n-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><Label htmlFor="n-model" hint="a hint only, never a limit">Usually sells</Label>
          <select id="n-model" className={inputCls} value={model} onChange={(e) => setModel(e.target.value as TaxonomyModel)}>{MODELS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        {level === 3 && <>
          <div><Label hint="decides the menu and workflows">Default templates</Label>
            <div className="flex flex-wrap gap-1.5">{(Object.keys(TEMPLATES) as TemplateKey[]).map((k) => { const on = tpls.includes(k); return (
              <button key={k} type="button" aria-pressed={on} onClick={() => setTpls(on ? tpls.filter((x) => x !== k) : [...tpls, k])} className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold', on ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70 hover:text-ink')}>{TEMPLATES[k].name}</button>); })}</div>
            <p className="t-small mt-1 text-muted-foreground">The first one chosen is the main template (it names shared menu items).</p></div>
          <div><Label htmlFor="n-kw" hint="comma separated; used to recognise this business from a bio or name">Recognition keywords</Label>
            <textarea id="n-kw" rows={3} className={cn(inputCls, 'h-auto py-3')} value={kw} onChange={(e) => setKw(e.target.value)} placeholder="pickle, achar, homemade pickles" /></div>
          <div><Label htmlFor="n-hl" hint="one per line; shown to owners as 'What you can do'">What owners can do</Label>
            <textarea id="n-hl" rows={4} className={cn(inputCls, 'h-auto py-3')} value={hl} onChange={(e) => setHl(e.target.value)} placeholder={'Add products with pack sizes and prices\nManage orders and track delivery'} /></div></>}
        <div className="flex items-center gap-3"><Switch on={active} onChange={setActive} label="Active" /><span className="t-label">Active</span><span className="t-small text-muted-foreground">Inactive entries are hidden from new businesses; nothing is deleted.</span></div>
        {err && <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className={btn.outline}>Cancel</button><button onClick={save} className={btn.brand}>Save</button></div>
      </div>
    </Modal>
  );
}

export default function CategoriesPage() {
  const { draft, upsertNode } = useStudio();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set(draft.taxonomy.filter((n) => n.level === 1).map((n) => n.id)));
  const [edit, setEdit] = useState<{ node?: TaxonomyNode; parent: TaxonomyNode | null } | null>(null);
  const kids = useMemo(() => { const m = new Map<string | null, TaxonomyNode[]>(); draft.taxonomy.forEach((n) => m.set(n.parentId, [...(m.get(n.parentId) ?? []), n])); return m; }, [draft.taxonomy]);
  const ql = q.trim().toLowerCase();
  const matches = (n: TaxonomyNode): boolean => n.name.toLowerCase().includes(ql) || (kids.get(n.id) ?? []).some(matches);

  const row = (n: TaxonomyNode, depth: number) => {
    if (ql && !matches(n)) return null;
    const children = kids.get(n.id) ?? [];
    const expanded = ql ? true : open.has(n.id);
    return (
      <li key={n.id}>
        <div className={cn('flex items-center gap-2 rounded-2xl px-3 py-2.5 hover:bg-white/70', !n.active && 'opacity-55')} style={{ paddingLeft: 12 + depth * 24 }}>
          {children.length ? <button aria-label={expanded ? 'Collapse' : 'Expand'} aria-expanded={expanded} onClick={() => setOpen((s) => { const x = new Set(s); x.has(n.id) ? x.delete(n.id) : x.add(n.id); return x; })} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary"><ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} /></button> : <span className="w-6" />}
          <span className="min-w-0 flex-1"><span className="font-semibold text-ink">{n.name}</span> <span className="ml-1.5"><Chip>{LEVEL[n.level]}</Chip></span>
            {n.level === 3 && <span className="t-small ml-2 text-muted-foreground">{n.defaultTemplates.map((t) => TEMPLATES[t]?.name).filter(Boolean).join(', ') || 'no template'} · {n.keywords?.length ?? 0} keywords</span>}</span>
          <span className="hidden sm:block"><Chip tone="neutral">{n.businessModel}</Chip></span>
          <Switch on={n.active} onChange={(v) => upsertNode({ ...n, active: v })} label={`${n.name} active`} />
          {n.level < 3 && <button aria-label={`Add under ${n.name}`} onClick={() => setEdit({ parent: n })} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white"><Plus className="h-4 w-4" /></button>}
          <button aria-label={`Edit ${n.name}`} onClick={() => setEdit({ node: n, parent: null })} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white"><Pencil className="h-3.5 w-3.5" /></button>
        </div>
        {expanded && children.length > 0 && <ul>{children.map((c) => row(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div>
      <PageHeader title="Categories" description="Industry, then category, then business type. The business type is what an owner is set up as. Deactivate instead of deleting."
        actions={<button className={btn.brand} onClick={() => setEdit({ parent: null })}><Plus className="h-4 w-4" />New industry</button>} />
      <div className="crm-card p-4 sm:p-5">
        <input aria-label="Search categories" placeholder="Search categories and business types" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, 'mb-3 max-w-sm')} />
        <ul>{(kids.get(null) ?? []).map((n) => row(n, 0))}</ul>
      </div>
      {edit && <NodeEditor node={edit.node} parent={edit.parent} onClose={() => setEdit(null)} />}
    </div>
  );
}
