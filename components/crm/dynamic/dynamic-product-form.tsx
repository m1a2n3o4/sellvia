'use client';

// Dynamic product form (Stage T2). Renders the schema resolved from the taxonomy; nothing is stored (simulated).
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { useCrm } from '../crm-context';
import { DynamicField, inputCls } from './dynamic-field';
import { flatFields, getNode, resolveFormSchema, validateValues, buildVariantCombos, variantKey } from '@/lib/crm/config/taxonomy/resolve-form';

export function DynamicProductForm({ businessTypes, productId }: { businessTypes: string[]; productId?: string }) {
  const { workspace, config } = useCrm();
  const [typeId, setTypeId] = useState(businessTypes[0]);
  const schema = useMemo(() => { try { return resolveFormSchema(typeId, config); } catch { return null; } }, [typeId, config]);
  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [axisSel, setAxisSel] = useState<Record<string, string[]>>({});
  const [vRows, setVRows] = useState<Record<string, { price: string; stock: string; sku: string }>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(!!productId);
  const real = !!workspace.real;

  // Edit mode: load the saved product (values, business type, variants) from the server.
  useEffect(() => {
    if (!productId) return;
    let live = true;
    (async () => {
      try {
        const r = await fetch(`/api/app/products/${productId}`, { cache: 'no-store' });
        const j = await r.json();
        if (!live) return;
        if (!r.ok) { setServerErr(j.error ?? 'Could not load the product'); setLoading(false); return; }
        const p = j.product as { businessTypeId: string | null; values: Record<string, unknown>; variants: { options: Record<string, string>; price: number; stock: number; sku: string }[] };
        if (p.businessTypeId) setTypeId(p.businessTypeId);
        setVals(p.values);
        const sel: Record<string, string[]> = {}; const rows: Record<string, { price: string; stock: string; sku: string }> = {};
        p.variants.forEach((v) => { Object.entries(v.options).forEach(([k, val]) => { sel[k] = Array.from(new Set([...(sel[k] ?? []), val])); }); rows[variantKey(v.options)] = { price: String(v.price), stock: String(v.stock), sku: v.sku }; });
        setAxisSel(sel); setVRows(rows); setLoading(false);
      } catch { if (live) { setServerErr('Could not reach the server'); setLoading(false); } }
    })();
    return () => { live = false; };
  }, [productId]);

  const switchType = (id: string) => { setTypeId(id); setVals({}); setErrors({}); setAxisSel({}); setVRows({}); };
  if (loading) return <div className="crm-card p-8 text-center text-sm text-muted-foreground">Loading product…</div>;
  if (!schema) return <div role="alert" className="crm-card p-5 text-sm font-semibold text-danger">This business type is not available. Core fields only would be shown once the backend is connected.</div>;

  const combos = buildVariantCombos(schema.variants.axes, axisSel);
  const labelOf = (cmb: Record<string, string>) => schema.variants.axes.map((a) => a.options.find((o) => o.value === cmb[a.key])?.label).filter(Boolean).join(' / ');

  const submit = async () => {
    // Only fields of the current business type are submitted (a loaded product may carry values from an older release).
    const known = new Set(flatFields(schema).map((f) => f.key));
    const r = validateValues(schema, Object.fromEntries(Object.entries(vals).filter(([k]) => known.has(k))));
    const e = { ...r.errors };
    combos.forEach((cmb) => { const row = vRows[variantKey(cmb)]; if (!row?.price) e[`variant:${variantKey(cmb)}`] = 'Price needed'; });
    setErrors(e); setServerErr('');
    if (Object.keys(e).length) return;
    if (!real) { setSaved(true); return; } // sample business: nothing is stored
    setBusy(true);
    try {
      const body = { businessTypeId: typeId, values: r.values, variants: combos.map((cmb) => { const row = vRows[variantKey(cmb)]; return { options: cmb, price: Number(row.price), stock: row.stock === '' ? 0 : Number(row.stock), sku: row.sku }; }) };
      const res = await fetch(productId ? `/api/app/products/${productId}` : '/api/app/products', { method: productId ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { if (j.fields) setErrors(j.fields); setServerErr(j.error ?? 'Could not save'); setBusy(false); return; }
      setBusy(false); setSaved(true);
    } catch { setServerErr('Could not reach the server. Please try again.'); setBusy(false); }
  };

  if (saved) return (
    <div className="crm-card flex flex-col items-center px-6 py-14 text-center">
      <CheckCircle2 className="mb-3 h-10 w-10 text-success" aria-hidden />
      <h2 className="t-h3">{real ? (productId ? 'Product updated' : 'Product saved') : 'Validated and saved as a draft (simulated)'}</h2>
      <p className="t-body mt-1 max-w-sm text-muted-foreground">{real ? 'It now appears in your product list.' : 'Values passed the same checks the server will run. Nothing was stored.'}</p>
      <div className="mt-5 flex gap-2">{!productId && <button onClick={() => { setSaved(false); setVals({}); setAxisSel({}); setVRows({}); }} className={btn.outline}>Add another</button>}<Link href="/app/catalogue/products" className={btn.brand}>Back to list</Link></div>
    </div>
  );

  const failed = Object.keys(errors).length;
  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-5" noValidate>
      <div className="crm-card flex flex-wrap items-center gap-3 p-4">
        <p className="t-small flex-1 text-muted-foreground">Fields come from the business type <strong className="text-ink">{getNode(typeId, config)?.name}</strong> and the levels above it.</p>
        {businessTypes.length > 1 && !productId && (
          <label className="flex items-center gap-2 text-sm font-semibold">Business type
            <select value={typeId} onChange={(e) => switchType(e.target.value)} className={cn(inputCls, '!h-10 w-52')}>
              {businessTypes.map((b) => <option key={b} value={b}>{getNode(b, config)?.name}</option>)}
            </select>
          </label>
        )}
      </div>
      {serverErr && <div role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{serverErr}</div>}
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
      <div className="flex gap-2"><button type="submit" disabled={busy} className={btn.brand}>{busy ? 'Saving…' : real ? (productId ? 'Save changes' : 'Save product') : 'Save as draft'}</button><Link href="/app/catalogue/products" className={btn.outline}>Cancel</Link></div>
      {!real && <p className="t-small text-muted-foreground">Workspace: {workspace.name}. Sample business: nothing is stored.</p>}
    </form>
  );
}
