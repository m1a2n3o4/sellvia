'use client';

// Dynamic product form (Stage T2). Renders the schema resolved from the taxonomy; nothing is stored (simulated).
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { useCrm } from '../crm-context';
import { DynamicField, inputCls } from './dynamic-field';
import { getNode, resolveFormSchema, validateValues, buildVariantCombos, variantKey } from '@/lib/crm/config/taxonomy/resolve-form';

export function DynamicProductForm({ businessTypes }: { businessTypes: string[] }) {
  const { workspace } = useCrm();
  const [typeId, setTypeId] = useState(businessTypes[0]);
  const schema = useMemo(() => { try { return resolveFormSchema(typeId); } catch { return null; } }, [typeId]);
  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [axisSel, setAxisSel] = useState<Record<string, string[]>>({});
  const [vRows, setVRows] = useState<Record<string, { price: string; stock: string; sku: string }>>({});
  const [saved, setSaved] = useState(false);

  const switchType = (id: string) => { setTypeId(id); setVals({}); setErrors({}); setAxisSel({}); setVRows({}); };
  if (!schema) return <div role="alert" className="crm-card p-5 text-sm font-semibold text-danger">This business type is not available. Core fields only would be shown once the backend is connected.</div>;

  const combos = buildVariantCombos(schema.variants.axes, axisSel);
  const labelOf = (cmb: Record<string, string>) => schema.variants.axes.map((a) => a.options.find((o) => o.value === cmb[a.key])?.label).filter(Boolean).join(' / ');

  const submit = () => {
    const r = validateValues(schema, vals);
    const e = { ...r.errors };
    combos.forEach((cmb) => { const row = vRows[variantKey(cmb)]; if (!row?.price) e[`variant:${variantKey(cmb)}`] = 'Price needed'; });
    setErrors(e); setSaved(Object.keys(e).length === 0);
  };

  if (saved) return (
    <div className="crm-card flex flex-col items-center px-6 py-14 text-center">
      <CheckCircle2 className="mb-3 h-10 w-10 text-success" aria-hidden />
      <h2 className="t-h3">Validated and saved as a draft (simulated)</h2>
      <p className="t-body mt-1 max-w-sm text-muted-foreground">Values passed the same checks the server will run. Nothing was stored.</p>
      <div className="mt-5 flex gap-2"><button onClick={() => { setSaved(false); setVals({}); setAxisSel({}); setVRows({}); }} className={btn.outline}>Add another</button><Link href="/app/catalogue/products" className={btn.brand}>Back to list</Link></div>
    </div>
  );

  const failed = Object.keys(errors).length;
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-5" noValidate>
      <div className="crm-card flex flex-wrap items-center gap-3 p-4">
        <p className="t-small flex-1 text-muted-foreground">Fields come from the business type <strong className="text-ink">{getNode(typeId)?.name}</strong> and the levels above it.</p>
        {businessTypes.length > 1 && (
          <label className="flex items-center gap-2 text-sm font-semibold">Business type
            <select value={typeId} onChange={(e) => switchType(e.target.value)} className={cn(inputCls, '!h-10 w-52')}>
              {businessTypes.map((b) => <option key={b} value={b}>{getNode(b)?.name}</option>)}
            </select>
          </label>
        )}
      </div>
      {failed > 0 && <div role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">Please fix {failed} field{failed > 1 ? 's' : ''} below.</div>}
      {schema.sections.map((sec) => (
        <section key={sec.name} className="crm-card p-5">
          <h2 className="t-h3 mb-4">{sec.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sec.fields.map((f) => <DynamicField key={f.key} f={f} v={vals[f.key]} error={errors[f.key]} set={(v) => setVals((s) => ({ ...s, [f.key]: v }))} />)}
          </div>
        </section>
      ))}
      {schema.variants.enabled && (
        <section className="crm-card p-5">
          <h2 className="t-h3">Variants</h2>
          <p className="t-small mb-3 text-muted-foreground">Options that change price or stock. Each combination below is its own sellable item.</p>
          {schema.variants.axes.map((ax) => (
            <div key={ax.key} className="mb-3">
              <p className="t-label mb-1.5">{ax.label}</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={ax.label}>
                {ax.options.map((o) => { const on = (axisSel[ax.key] ?? []).includes(o.value); return (
                  <button key={o.value} type="button" aria-pressed={on} onClick={() => setAxisSel((s) => ({ ...s, [ax.key]: on ? (s[ax.key] ?? []).filter((x) => x !== o.value) : [...(s[ax.key] ?? []), o.value] }))}
                    className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all', on ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70 hover:text-ink')}>{o.label}</button>); })}
              </div>
            </div>
          ))}
          {combos.length > 0 && (
            <div className="crm-scroll mt-3 overflow-x-auto"><table className="w-full min-w-[460px] text-sm">
              <thead><tr className="t-micro text-left text-muted-foreground"><th className="py-2">Variant</th><th className="py-2">Price (₹)</th><th className="py-2">Stock</th><th className="py-2">SKU</th></tr></thead>
              <tbody>{combos.map((cmb) => { const k = variantKey(cmb); const row = vRows[k] ?? { price: '', stock: '', sku: '' }; const upd = (p: Partial<typeof row>) => setVRows((s) => ({ ...s, [k]: { ...row, ...p } })); return (
                <tr key={k} className="border-t border-white/70">
                  <td className="py-2 font-semibold">{labelOf(cmb)}</td>
                  <td className="py-2"><input aria-label={`Price for ${labelOf(cmb)}`} aria-invalid={!!errors[`variant:${k}`] || undefined} type="number" min={0} value={row.price} onChange={(e) => upd({ price: e.target.value })} className={cn(inputCls, '!h-9 w-28', errors[`variant:${k}`] && 'ring-2 ring-danger/40')} /></td>
                  <td className="py-2"><input aria-label={`Stock for ${labelOf(cmb)}`} type="number" min={0} value={row.stock} onChange={(e) => upd({ stock: e.target.value })} className={cn(inputCls, '!h-9 w-24')} /></td>
                  <td className="py-2"><input aria-label={`SKU for ${labelOf(cmb)}`} value={row.sku} onChange={(e) => upd({ sku: e.target.value })} className={cn(inputCls, '!h-9 w-32')} /></td>
                </tr>); })}</tbody></table></div>
          )}
        </section>
      )}
      <div className="flex gap-2"><button type="submit" className={btn.brand}>Save as draft</button><Link href="/app/catalogue/products" className={btn.outline}>Cancel</Link></div>
      <p className="t-small text-muted-foreground">Workspace: {workspace.name}. Simulated: nothing is stored.</p>
    </form>
  );
}
