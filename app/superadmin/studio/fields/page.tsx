'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/crm/page-header';
import { useStudio } from '@/lib/studio/store';
import type { FieldDefinition } from '@/lib/crm/config/taxonomy/types';
import { FieldEditor, ADMIN_TYPES } from '@/components/studio/field-editor';
import { Chip, Switch, inputCls, btn } from '@/components/studio/ui';

export default function FieldsPage() {
  const { draft, upsertField } = useStudio();
  const [q, setQ] = useState(''); const [type, setType] = useState('');
  const [edit, setEdit] = useState<{ field?: FieldDefinition } | null>(null);
  const nodeName = (id?: string) => draft.taxonomy.find((n) => n.id === id)?.name ?? id;
  const usage = useMemo(() => {
    const m = new Map<string, string[]>();
    draft.mappings.forEach((mp) => m.set(mp.fieldId, [...(m.get(mp.fieldId) ?? []), mp.scope === 'global' ? 'Every business' : nodeName(mp.scopeId) ?? '']));
    return m;
  }, [draft.mappings, draft.taxonomy]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = draft.fields.filter((f) => (!q || `${f.label} ${f.key}`.toLowerCase().includes(q.toLowerCase())) && (!type || f.type === type));
  const typeLabel = (t: string) => ADMIN_TYPES.find((x) => x.value === t)?.label ?? (t === 'images' ? 'Product images' : t);

  return (
    <div>
      <PageHeader title="Field library" description="Reusable fields. Create a field once, then assign it to any category or business type."
        actions={<button className={btn.brand} onClick={() => setEdit({})}><Plus className="h-4 w-4" />New field</button>} />
      <div className="crm-card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <input aria-label="Search fields" placeholder="Search by label or key" value={q} onChange={(e) => setQ(e.target.value)} className={cn(inputCls, 'max-w-xs')} />
          <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} className={cn(inputCls, 'max-w-[14rem]')}><option value="">All types</option>{ADMIN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          <span className="t-small self-center text-muted-foreground">{list.length} of {draft.fields.length}</span>
        </div>
        <div className="crm-scroll overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead><tr className="t-micro text-left text-muted-foreground"><th className="py-2 pl-2">Field</th><th>Type</th><th>Used in</th><th>Active</th><th /></tr></thead>
          <tbody>{list.map((f) => { const u = Array.from(new Set(usage.get(f.id) ?? [])); return (
            <tr key={f.id} className={cn('border-t border-white/80', !f.active && 'opacity-55')}>
              <td className="py-3 pl-2"><span className="font-semibold text-ink">{f.label}</span>{f.isSystem && <span className="ml-2"><Chip tone="brand">Core</Chip></span>}<span className="t-small block text-muted-foreground">{f.key}</span></td>
              <td><Chip>{typeLabel(f.type)}</Chip></td>
              <td className="t-small max-w-[18rem] text-muted-foreground">{u.length ? (u.length > 3 ? `${u.slice(0, 3).join(', ')} +${u.length - 3}` : u.join(', ')) : 'Not used yet'}</td>
              <td>{f.isSystem ? <span className="t-small text-muted-foreground">Always on</span> : <Switch on={f.active} onChange={(v) => upsertField({ ...f, active: v })} label={`${f.label} active`} />}</td>
              <td className="pr-2 text-right"><button aria-label={`Edit ${f.label}`} onClick={() => setEdit({ field: f })} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-white"><Pencil className="h-3.5 w-3.5" /></button></td>
            </tr>); })}</tbody></table></div>
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No fields match.</p>}
      </div>
      {edit && <FieldEditor field={edit.field} onClose={() => setEdit(null)} />}
    </div>
  );
}
