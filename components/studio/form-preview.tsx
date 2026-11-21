'use client';

// Live preview of the owner's product form for a resolved schema (what the business will see).
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DynamicField } from '@/components/crm/dynamic/dynamic-field';
import type { ResolvedFormSchema } from '@/lib/crm/config/taxonomy/types';

export function FormPreview({ schema }: { schema: ResolvedFormSchema }) {
  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [sel, setSel] = useState<Record<string, string[]>>({});
  return (
    <div className="space-y-4" aria-label="Form preview">
      <p className="t-small rounded-2xl bg-secondary px-4 py-2.5 text-muted-foreground">This is exactly what the business owner sees. You can type in it; nothing is saved.</p>
      {schema.sections.map((sec) => (
        <section key={sec.name} className="rounded-3xl border border-white/90 bg-white/60 p-4">
          <h3 className="t-h3 mb-3 !text-[16px]">{sec.name}</h3>
          <div className="grid gap-4 md:grid-cols-2">{sec.fields.map((f) => <DynamicField key={f.key} f={f} v={vals[f.key]} set={(v) => setVals((s) => ({ ...s, [f.key]: v }))} />)}</div>
        </section>))}
      {schema.variants.enabled && (
        <section className="rounded-3xl border border-white/90 bg-white/60 p-4"><h3 className="t-h3 mb-3 !text-[16px]">Variants</h3>
          {schema.variants.axes.map((ax) => (
            <div key={ax.key} className="mb-2"><p className="t-label mb-1.5">{ax.label}</p>
              <div className="flex flex-wrap gap-1.5">{ax.options.map((o) => { const on = (sel[ax.key] ?? []).includes(o.value); return (
                <button key={o.value} type="button" aria-pressed={on} onClick={() => setSel((s) => ({ ...s, [ax.key]: on ? (s[ax.key] ?? []).filter((x) => x !== o.value) : [...(s[ax.key] ?? []), o.value] }))}
                  className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold', on ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70')}>{o.label}</button>); })}</div></div>))}
        </section>)}
    </div>
  );
}
