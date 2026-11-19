'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldDef } from '@/lib/crm/config/types';
import { resolveFields } from '@/lib/crm/config/resolve';
import { btn } from '../button-styles';
import { useCrm } from '../crm-context';

type Val = string | string[];
const input = 'h-11 w-full rounded-2xl border border-white/90 bg-white/80 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]';

function Field({ f, v, set }: { f: FieldDef; v: Val; set: (v: Val) => void }) {
  const id = `f-${f.key}`;
  const s = typeof v === 'string' ? v : '';
  switch (f.type) {
    case 'textarea': return <textarea id={id} value={s} onChange={(e) => set(e.target.value)} rows={3} className={cn(input, 'h-auto py-3')} />;
    case 'number': case 'currency': return <input id={id} type="number" min={0} inputMode="decimal" value={s} onChange={(e) => set(e.target.value)} className={input} placeholder={f.type === 'currency' ? '₹' : '0'} />;
    case 'date': case 'time': return <input id={id} type={f.type} value={s} onChange={(e) => set(e.target.value)} className={input} />;
    case 'dropdown': return (
      <select id={id} value={s} onChange={(e) => set(e.target.value)} className={input}><option value="">Select</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>);
    case 'multiselect': {
      const sel = Array.isArray(v) ? v : [];
      return <div className="flex flex-wrap gap-1.5" role="group" aria-label={f.label}>{(f.options ?? []).map((o) => (
        <button key={o} type="button" aria-pressed={sel.includes(o)} onClick={() => set(sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o])}
          className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all', sel.includes(o) ? 'bg-primary text-white' : 'bg-white/80 text-muted-foreground hover:text-ink')}>{o}</button>))}</div>;
    }
    case 'images': return <div className="rounded-2xl border border-dashed border-[#c3c9db] bg-white/50 p-6 text-center text-sm text-muted-foreground">Image upload arrives with the backend. (Simulated)</div>;
    case 'toggle': return <input id={id} type="checkbox" checked={s === 'true'} onChange={(e) => set(String(e.target.checked))} className="h-5 w-5" />;
    default: return <input id={id} type={f.type === 'url' ? 'url' : 'text'} value={s} onChange={(e) => set(e.target.value)} className={input} />;
  }
}

export function ProductForm() {
  const { workspace } = useCrm();
  const { fields, label, fromTemplate } = resolveFields(workspace.templates, 'products');
  const [vals, setVals] = useState<Record<string, Val>>({});
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string[]>([]);
  const sections = useMemo(() => Array.from(new Set(fields.map((f) => f.section))), [fields]);
  const sizes = (vals.sizes as string[]) ?? []; const colours = (vals.colours as string[]) ?? [];
  const variants = sizes.flatMap((s) => (colours.length ? colours : ['']).map((c) => [s, c].filter(Boolean).join(' / ')));
  const [vStock, setVStock] = useState<Record<string, string>>({});

  const submit = () => {
    const missing = fields.filter((f) => f.required && !String(vals[f.key] ?? '').trim()).map((f) => f.label);
    setErr(missing); setSaved(missing.length === 0);
  };

  if (saved) return (
    <div className="crm-card flex flex-col items-center px-6 py-14 text-center">
      <CheckCircle2 className="mb-3 h-10 w-10 text-success" aria-hidden />
      <h2 className="t-h3">Saved as a draft (simulated)</h2>
      <p className="t-body mt-1 max-w-sm text-muted-foreground">Nothing was stored. When the backend is connected this creates a draft product.</p>
      <div className="mt-5 flex gap-2"><button onClick={() => { setSaved(false); setVals({}); }} className={btn.outline}>Add another</button><Link href="/app/catalogue/products" className={btn.brand}>Back to list</Link></div>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-5" noValidate>
      <p className="t-small text-muted-foreground">{fromTemplate ? `Form fields come from this business's template (${label}).` : 'Standard fields. A template can add more.'}</p>
      {err.length > 0 && <div role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">Please fill: {err.join(', ')}</div>}
      {sections.map((sec) => (
        <section key={sec} className="crm-card p-5">
          <h2 className="t-h3 mb-4">{sec}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.filter((f) => f.section === sec).map((f) => (
              <div key={f.key} className={cn((f.type === 'textarea' || f.type === 'images' || f.type === 'multiselect') && 'md:col-span-2')}>
                <label htmlFor={`f-${f.key}`} className="t-label mb-1.5 block">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
                <Field f={f} v={vals[f.key] ?? (f.type === 'multiselect' ? [] : '')} set={(v) => setVals((s) => ({ ...s, [f.key]: v }))} />
              </div>
            ))}
          </div>
        </section>
      ))}
      {variants.length > 0 && (
        <section className="crm-card p-5">
          <h2 className="t-h3">Variants</h2>
          <p className="t-small mb-3 text-muted-foreground">One row per size and colour. Each variant keeps its own stock.</p>
          <div className="crm-scroll overflow-x-auto"><table className="w-full min-w-[360px] text-sm"><thead><tr className="t-micro text-left text-muted-foreground"><th className="py-2">Variant</th><th className="py-2">Stock</th></tr></thead>
            <tbody>{variants.map((v) => <tr key={v} className="border-t border-white/70"><td className="py-2 font-semibold">{v}</td>
              <td className="py-2"><input aria-label={`Stock for ${v}`} type="number" min={0} value={vStock[v] ?? ''} onChange={(e) => setVStock((s) => ({ ...s, [v]: e.target.value }))} className={cn(input, '!h-9 w-28')} /></td></tr>)}</tbody></table></div>
        </section>
      )}
      <div className="flex gap-2"><button type="submit" className={btn.brand}>Save as draft</button><Link href="/app/catalogue/products" className={btn.outline}>Cancel</Link></div>
    </form>
  );
}
