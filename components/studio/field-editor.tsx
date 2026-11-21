'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DataType, FieldDefinition, FieldOption, Validation } from '@/lib/crm/config/taxonomy/types';
import { useStudio } from '@/lib/studio/store';
import { Modal, Label, Switch, inputCls, btn, slugify } from './ui';

export const ADMIN_TYPES: { value: DataType; label: string }[] = [
  { value: 'text', label: 'Short text' }, { value: 'textarea', label: 'Long text' }, { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown (one)' }, { value: 'radio', label: 'Radio buttons' }, { value: 'multi_select', label: 'Multi-select' },
  { value: 'checkbox', label: 'Checkbox' }, { value: 'toggle', label: 'Yes / No toggle' }, { value: 'date', label: 'Date' },
  { value: 'url', label: 'Web link' }, { value: 'measurement', label: 'Measurement (number + unit)' },
  { value: 'image', label: 'Image' }, { value: 'file', label: 'File' },
];
const CHOICE: DataType[] = ['select', 'radio', 'multi_select'];

export function FieldEditor({ field, onClose, onSaved }: { field?: FieldDefinition; onClose: () => void; onSaved?: (f: FieldDefinition) => void }) {
  const { draft, upsertField } = useStudio();
  const isNew = !field;
  const used = useMemo(() => !!field && draft.mappings.some((m) => m.fieldId === field.id), [field, draft.mappings]);
  const [label, setLabel] = useState(field?.label ?? '');
  const [key, setKey] = useState(field?.key ?? '');
  const [keyTouched, setKeyTouched] = useState(false);
  const [type, setType] = useState<DataType>(field?.type ?? 'text');
  const [placeholder, setPlaceholder] = useState(field?.placeholder ?? '');
  const [help, setHelp] = useState(field?.helpText ?? '');
  const [unit, setUnit] = useState(field?.unit ?? '');
  const [options, setOptions] = useState<FieldOption[]>(field?.options ?? []);
  const [v, setV] = useState<Validation>(field?.validation ?? {});
  const [unitsText, setUnitsText] = useState((field?.validation?.units ?? []).join(', '));
  const [active, setActive] = useState(field?.active ?? true);
  const [err, setErr] = useState('');

  const sys = !!field?.isSystem;
  const lockKey = !isNew && (used || sys);   // keys are immutable once used
  const lockType = !isNew && (used || sys);
  const num = (s: string) => (s === '' ? undefined : Number(s));

  const save = () => {
    const k = isNew && !keyTouched ? slugify(label) : key;
    if (!label.trim()) return setErr('Give the field a label.');
    if (!/^[a-z][a-z0-9_]{1,40}$/.test(k)) return setErr('Key must be lowercase letters, numbers and underscores, starting with a letter.');
    if (draft.fields.some((f) => f.key === k && f.id !== field?.id)) return setErr(`The key "${k}" already exists.`);
    if (CHOICE.includes(type) && options.filter((o) => o.label.trim()).length === 0) return setErr('Add at least one option.');
    const units = unitsText.split(',').map((u) => u.trim()).filter(Boolean);
    if (type === 'measurement' && units.length === 0) return setErr('Add at least one unit (for example: g, kg).');
    const clean: Validation = { ...v, ...(type === 'measurement' ? { units } : {}) };
    (Object.keys(clean) as (keyof Validation)[]).forEach((x) => { if (clean[x] === undefined || clean[x] === false) delete clean[x]; });
    const opts = CHOICE.includes(type) ? options.filter((o) => o.label.trim()).map((o) => ({ label: o.label.trim(), value: o.value || slugify(o.label) })) : undefined;
    const f: FieldDefinition = {
      id: field?.id ?? `fd_${k}`, key: k, label: label.trim(), type, entity: 'product', active, isSystem: field?.isSystem,
      placeholder: placeholder || undefined, helpText: help || undefined, unit: unit || undefined, options: opts, validation: Object.keys(clean).length ? clean : undefined,
    };
    upsertField(f); onSaved?.(f); onClose();
  };

  return (
    <Modal title={isNew ? 'New field' : `Edit field: ${field!.label}`} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label htmlFor="fe-label">Label</Label><input id="fe-label" className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} autoFocus /></div>
        <div><Label htmlFor="fe-key" hint={lockKey ? 'Locked: in use' : 'machine name'}>Key</Label>
          <input id="fe-key" className={inputCls} disabled={lockKey} value={isNew && !keyTouched ? slugify(label) : key} onChange={(e) => { setKey(e.target.value); setKeyTouched(true); }} /></div>
        <div><Label htmlFor="fe-type" hint={lockType ? 'Locked: in use' : undefined}>Type</Label>
          <select id="fe-type" className={inputCls} disabled={lockType} value={type} onChange={(e) => setType(e.target.value as DataType)}>
            {sys && <option value={type}>{type}</option>}{!sys && ADMIN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        <div><Label htmlFor="fe-unit" hint="optional, shown beside the value">Unit</Label><input id="fe-unit" className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. months" /></div>
        <div><Label htmlFor="fe-ph">Placeholder</Label><input id="fe-ph" className={inputCls} value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} /></div>
        <div><Label htmlFor="fe-help">Help text</Label><input id="fe-help" className={inputCls} value={help} onChange={(e) => setHelp(e.target.value)} /></div>
      </div>

      {(type === 'text' || type === 'textarea') && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div><Label>Minimum length</Label><input type="number" min={0} className={inputCls} value={v.minLength ?? ''} onChange={(e) => setV({ ...v, minLength: num(e.target.value) })} /></div>
          <div><Label>Maximum length</Label><input type="number" min={1} className={inputCls} value={v.maxLength ?? ''} onChange={(e) => setV({ ...v, maxLength: num(e.target.value) })} /></div>
          <div className="md:col-span-2"><Label hint="safe presets only">Format check</Label>
            <select className={inputCls} value={v.preset ?? ''} onChange={(e) => setV({ ...v, preset: (e.target.value || undefined) as Validation['preset'] })}><option value="">None</option><option value="email">Email</option><option value="phone">Phone</option><option value="pincode">Pincode</option></select></div>
        </div>)}
      {(type === 'number' || type === 'measurement') && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div><Label>Minimum</Label><input type="number" className={inputCls} value={v.min ?? ''} onChange={(e) => setV({ ...v, min: num(e.target.value) })} /></div>
          <div><Label>Maximum</Label><input type="number" className={inputCls} value={v.max ?? ''} onChange={(e) => setV({ ...v, max: num(e.target.value) })} /></div>
          {type === 'number' && <div className="flex items-end gap-3 pb-3"><Switch on={!!v.integerOnly} onChange={(x) => setV({ ...v, integerOnly: x })} label="Whole numbers only" /><span className="t-label">Whole numbers only</span></div>}
          {type === 'measurement' && <div className="md:col-span-3"><Label hint="comma separated">Allowed units</Label><input className={inputCls} value={unitsText} onChange={(e) => setUnitsText(e.target.value)} placeholder="g, kg" /></div>}
        </div>)}
      {type === 'date' && (
        <div className="mt-4 grid gap-4 md:grid-cols-2"><div><Label>Earliest date</Label><input type="date" className={inputCls} value={v.minDate ?? ''} onChange={(e) => setV({ ...v, minDate: e.target.value || undefined })} /></div>
          <div><Label>Latest date</Label><input type="date" className={inputCls} value={v.maxDate ?? ''} onChange={(e) => setV({ ...v, maxDate: e.target.value || undefined })} /></div></div>)}
      {CHOICE.includes(type) && (
        <div className="mt-4">
          <Label hint={isNew ? undefined : 'Removing an option hides it for new entries; saved values are kept'}>Options</Label>
          <ul className="space-y-2">{options.map((o, i) => (
            <li key={i} className="flex gap-2"><input aria-label={`Option ${i + 1}`} className={inputCls} value={o.label} onChange={(e) => setOptions(options.map((x, j) => (j === i ? { ...x, label: e.target.value, value: x.value || '' } : x)))} />
              <button type="button" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions(options.filter((_, j) => j !== i))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary hover:bg-white"><Trash2 className="h-4 w-4" /></button></li>))}</ul>
          <button type="button" onClick={() => setOptions([...options, { label: '', value: '' }])} className={`${btn.outline} mt-2`}><Plus className="h-4 w-4" />Add option</button>
        </div>)}
      {(type === 'image' || type === 'file') && <p className="t-small mt-4 rounded-2xl bg-secondary p-3 text-muted-foreground">File rules (type and size) come from the platform upload service. Uploads are simulated until the backend is connected.</p>}

      <div className="mt-5 flex items-center gap-3"><Switch on={active} onChange={setActive} label="Active" /><span className="t-label">Active</span><span className="t-small text-muted-foreground">Inactive fields disappear from new forms; saved data is kept.</span></div>
      {err && <p role="alert" className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{err}</p>}
      <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className={btn.outline}>Cancel</button><button onClick={save} className={btn.brand}>{isNew ? 'Create field' : 'Save changes'}</button></div>
    </Modal>
  );
}
