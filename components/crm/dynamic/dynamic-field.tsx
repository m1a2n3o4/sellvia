'use client';

// Field renderer registry keyed by data type (Stage T2). Add a type = add one entry here and one case in validateValues.
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { ResolvedField, DataType } from '@/lib/crm/config/taxonomy/types';

export const inputCls = 'h-11 w-full rounded-2xl border border-ink/70 bg-white px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]';

interface P { f: ResolvedField; v: unknown; set: (v: unknown) => void; id: string; invalid: boolean }
const ariaOf = (p: P) => ({ id: p.id, 'aria-invalid': p.invalid || undefined, 'aria-describedby': p.f.helpText ? `${p.id}-help` : undefined });
const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '');

const Text = (p: P) => <input {...ariaOf(p)} type="text" value={str(p.v)} placeholder={p.f.placeholder} onChange={(e) => p.set(e.target.value)} className={inputCls} />;
const Url = (p: P) => <input {...ariaOf(p)} type="url" value={str(p.v)} placeholder={p.f.placeholder ?? 'https://'} onChange={(e) => p.set(e.target.value)} className={inputCls} />;
const Area = (p: P) => <textarea {...ariaOf(p)} rows={3} value={str(p.v)} placeholder={p.f.placeholder} onChange={(e) => p.set(e.target.value)} className={cn(inputCls, 'h-auto py-3')} />;
const Num = (p: P) => (
  <div className="relative">
    <input {...ariaOf(p)} type="number" inputMode="decimal" min={p.f.validation?.min} max={p.f.validation?.max} step={p.f.validation?.step ?? (p.f.validation?.integerOnly ? 1 : 'any')}
      value={str(p.v)} onChange={(e) => p.set(e.target.value === '' ? '' : e.target.value)} className={cn(inputCls, p.f.unit && 'pr-20')} />
    {p.f.unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">{p.f.unit}</span>}
  </div>
);
const Measure = (p: P) => {
  const units = p.f.validation?.units ?? (p.f.unit ? [p.f.unit] : []);
  const cur = (p.v && typeof p.v === 'object' ? p.v : {}) as { value?: string; unit?: string };
  return (
    <div className="flex gap-2">
      <input {...ariaOf(p)} type="number" inputMode="decimal" min={p.f.validation?.min} value={cur.value ?? ''} onChange={(e) => p.set({ value: e.target.value, unit: cur.unit ?? units[0] })} className={inputCls} />
      <select aria-label={`${p.f.label} unit`} value={cur.unit ?? units[0]} onChange={(e) => p.set({ value: cur.value ?? '', unit: e.target.value })} className={cn(inputCls, 'w-28')}>
        {units.map((u) => <option key={u}>{u}</option>)}
      </select>
    </div>
  );
};
const Date_ = (p: P) => <input {...ariaOf(p)} type="date" min={p.f.validation?.minDate} max={p.f.validation?.maxDate} value={str(p.v)} onChange={(e) => p.set(e.target.value)} className={inputCls} />;
const Select = (p: P) => (
  <select {...ariaOf(p)} value={str(p.v)} onChange={(e) => p.set(e.target.value)} className={inputCls}>
    <option value="">Select</option>{p.f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
const Radio = (p: P) => (
  <div role="radiogroup" aria-label={p.f.label} className="flex flex-wrap gap-2">
    {p.f.options?.map((o) => (
      <button key={o.value} type="button" role="radio" aria-checked={p.v === o.value} onClick={() => p.set(o.value)}
        className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-all', p.v === o.value ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70 hover:text-ink')}>{o.label}</button>
    ))}
  </div>
);
const Multi = (p: P) => {
  const sel = Array.isArray(p.v) ? (p.v as string[]) : [];
  return (
    <div role="group" aria-label={p.f.label} className="flex flex-wrap gap-1.5">
      {p.f.options?.map((o) => (
        <button key={o.value} type="button" aria-pressed={sel.includes(o.value)} onClick={() => p.set(sel.includes(o.value) ? sel.filter((x) => x !== o.value) : [...sel, o.value])}
          className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all', sel.includes(o.value) ? 'border border-primary bg-primary text-white' : 'border border-ink/70 bg-white text-ink/70 hover:text-ink')}>{o.label}</button>
      ))}
    </div>
  );
};
const Toggle = (p: P) => (
  <button {...ariaOf(p)} type="button" role="switch" aria-checked={p.v === true} onClick={() => p.set(p.v !== true)}
    className={cn('relative h-7 w-12 rounded-full transition-colors', p.v === true ? 'bg-primary' : 'bg-[#c3c9db]')}>
    <span className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', p.v === true ? 'left-[22px]' : 'left-0.5')} />
  </button>
);
const Upload = (p: P) => <div className="rounded-2xl border border-dashed border-[#c3c9db] bg-white/50 p-5 text-center text-sm text-muted-foreground">{p.f.label}: upload arrives with the backend. (Simulated)</div>;

const REGISTRY: Record<DataType, (p: P) => ReactElement> = {
  text: Text, textarea: Area, number: Num, select: Select, radio: Radio, checkbox: Toggle, multi_select: Multi,
  date: Date_, toggle: Toggle, url: Url, measurement: Measure, image: Upload, file: Upload, images: Upload,
};

export const isWide = (t: DataType) => t === 'textarea' || t === 'images' || t === 'multi_select' || t === 'image' || t === 'file' || t === 'radio';

export function DynamicField({ f, v, set, error }: { f: ResolvedField; v: unknown; set: (v: unknown) => void; error?: string }) {
  const id = `f-${f.key}`;
  const Render = REGISTRY[f.type];
  return (
    <div className={cn(isWide(f.type) && 'md:col-span-2')}>
      <label htmlFor={id} className="t-label mb-1.5 block">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
      <Render f={f} v={v} set={set} id={id} invalid={!!error} />
      {f.helpText && <p id={`${id}-help`} className="t-small mt-1 text-muted-foreground">{f.helpText}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
