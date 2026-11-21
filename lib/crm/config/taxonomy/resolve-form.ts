// Pure resolver and validator for dynamic product forms (Stage T1).
// Same code serves the admin preview, the client form and (later) the server.
import { TAXONOMY, FIELD_LIBRARY, FIELD_MAPPINGS, VARIANT_AXES, MENUS } from './seed';
import type {
  TaxonomyNode, FieldDefinition, FieldMapping, ResolvedField, ResolvedFormSchema, ResolvedSection,
  VariantAxis, Validation, FieldSource, MenuConfig,
} from './types';

export interface ConfigSource { taxonomy: TaxonomyNode[]; fields: FieldDefinition[]; mappings: FieldMapping[]; axes: Record<string, VariantAxis[]>;
  /** Menu overrides per taxonomy node. Optional so older saved drafts still load. */
  menus?: Record<string, MenuConfig> }
export const SEED: ConfigSource = { taxonomy: TAXONOMY, fields: FIELD_LIBRARY, mappings: FIELD_MAPPINGS, axes: VARIANT_AXES, menus: MENUS };

export const getNode = (id: string, src: ConfigSource = SEED) => src.taxonomy.find((t) => t.id === id);

/** Root-first ancestor chain including the node itself. Rejects unknown nodes, cycles and depth over 3. */
export function ancestorChain(id: string, src: ConfigSource = SEED): TaxonomyNode[] {
  const chain: TaxonomyNode[] = [];
  const seen = new Set<string>();
  let cur = getNode(id, src);
  if (!cur) throw new Error(`Unknown business type: ${id}`);
  while (cur) {
    if (seen.has(cur.id)) throw new Error(`Circular category relationship at ${cur.id}`);
    seen.add(cur.id);
    chain.unshift(cur);
    if (chain.length > 3) throw new Error('Taxonomy deeper than 3 levels');
    cur = cur.parentId ? getNode(cur.parentId, src) : undefined;
    if (cur === undefined && chain[0].parentId) throw new Error(`Missing parent of ${chain[0].id}`);
  }
  return chain;
}

const mergeValidation = (a?: Validation, b?: Validation): Validation | undefined => (a || b ? { ...a, ...b } : undefined);

/** Resolve the product form for a business type (subcategory). Global, then category, then subcategory. */
export function resolveFormSchema(businessTypeId: string, src: ConfigSource = SEED, version = 1): ResolvedFormSchema {
  const chain = ancestorChain(businessTypeId, src);
  const node = chain[chain.length - 1];
  if (!node.active) throw new Error(`Business type is inactive: ${node.id}`);
  if (node.level !== 3) throw new Error(`${node.id} is not a business type (subcategory)`);

  const scopes: { scope: FieldSource; id?: string }[] = [
    { scope: 'global' },
    ...chain.slice(0, -1).filter((c) => c.level === 2).map((c) => ({ scope: 'category' as const, id: c.id })),
    { scope: 'subcategory', id: node.id },
  ];
  const byId = new Map(src.fields.map((fd) => [fd.id, fd]));
  const out = new Map<string, ResolvedField>();
  const warnings: string[] = [];

  for (const sc of scopes) {
    const maps = src.mappings.filter((mp) => mp.scope === sc.scope && (sc.scope === 'global' || mp.scopeId === sc.id));
    for (const mp of maps) {
      const fd = byId.get(mp.fieldId);
      if (!fd) { warnings.push(`Mapping refers to unknown field ${mp.fieldId}`); continue; }
      if (!fd.active) continue;
      if (mp.enabled === false) {
        if (fd.isSystem) { warnings.push(`Core field "${fd.label}" cannot be hidden (ignored)`); continue; }
        out.delete(fd.id);
        continue;
      }
      const prev = out.get(fd.id);
      out.set(fd.id, {
        id: fd.id, key: fd.key, label: fd.label, type: fd.type, isSystem: !!fd.isSystem,
        unit: fd.unit,
        required: mp.required ?? prev?.required ?? false,
        section: mp.section ?? prev?.section ?? 'Details',
        order: mp.order ?? prev?.order ?? 999,
        placeholder: mp.placeholder ?? prev?.placeholder ?? fd.placeholder,
        helpText: mp.helpText ?? prev?.helpText ?? fd.helpText,
        options: mp.options ?? prev?.options ?? fd.options,
        validation: mergeValidation(prev?.validation ?? fd.validation, mp.validation),
        source: sc.scope,
      });
    }
  }

  const fields = Array.from(out.values()).sort((x, y) => x.order - y.order);
  const sections: ResolvedSection[] = [];
  for (const fl of fields) {
    let sec = sections.find((s) => s.name === fl.section);
    if (!sec) { sec = { name: fl.section, fields: [] }; sections.push(sec); }
    sec.fields.push(fl);
  }

  // Variant axes: nearest level wins.
  let axes: VariantAxis[] = [];
  for (let i = chain.length - 1; i >= 0; i--) { if (src.axes[chain[i].id]) { axes = src.axes[chain[i].id]; break; } }

  return { businessTypeId, version, chain: chain.map((c) => c.id), sections, variants: { enabled: axes.length > 0, axes }, warnings };
}

export const flatFields = (schema: ResolvedFormSchema): ResolvedField[] => schema.sections.flatMap((s) => s.fields);

// ---------- validation (server is the authority; the same function backs client UX) ----------
const PRESETS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9]{10,13}$/,
  pincode: /^[1-9][0-9]{5}$/,
};
const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

export interface ValidationResult { ok: boolean; errors: Record<string, string>; values: Record<string, unknown> }

/** Validate submitted values against a resolved schema. Unknown keys are rejected. */
export function validateValues(schema: ResolvedFormSchema, input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const fields = flatFields(schema);
  const known = new Set(fields.map((x) => x.key));
  for (const k of Object.keys(input)) if (!known.has(k)) errors[k] = 'Unknown field';

  for (const fl of fields) {
    const v = input[fl.key];
    const vd = fl.validation ?? {};
    if (isEmpty(v) && !(fl.type === 'toggle' || fl.type === 'checkbox')) {
      if (fl.required) errors[fl.key] = `${fl.label} is required`;
      continue;
    }
    const err = (msg: string) => { errors[fl.key] = msg; };
    switch (fl.type) {
      case 'text': case 'textarea': case 'url': {
        if (typeof v !== 'string') { err('Must be text'); break; }
        if (vd.minLength && v.trim().length < vd.minLength) err(`At least ${vd.minLength} characters`);
        else if (vd.maxLength && v.length > vd.maxLength) err(`At most ${vd.maxLength} characters`);
        else if (fl.type === 'url' && !/^https?:\/\/[^\s]+$/i.test(v)) err('Enter a valid link starting with http(s)://');
        else if (vd.preset && !PRESETS[vd.preset].test(v)) err(`Enter a valid ${vd.preset}`);
        else values[fl.key] = v.trim();
        break;
      }
      case 'number': {
        const num = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(num)) { err('Must be a number'); break; }
        if (vd.integerOnly && !Number.isInteger(num)) err('Must be a whole number');
        else if (vd.min !== undefined && num < vd.min) err(`Must be at least ${vd.min}`);
        else if (vd.max !== undefined && num > vd.max) err(`Must be at most ${vd.max}`);
        else values[fl.key] = num;
        break;
      }
      case 'measurement': {
        const mv = v as { value?: unknown; unit?: unknown };
        const num = Number(mv?.value);
        const units = vd.units ?? (fl.unit ? [fl.unit] : []);
        if (typeof v !== 'object' || v === null || !Number.isFinite(num)) { err('Enter a number and a unit'); break; }
        if (units.length && !units.includes(String(mv.unit))) err('Choose a valid unit');
        else if (vd.min !== undefined && num < vd.min) err(`Must be at least ${vd.min}`);
        else values[fl.key] = { value: num, unit: String(mv.unit) };
        break;
      }
      case 'select': case 'radio': {
        if (typeof v !== 'string' || !fl.options?.some((op) => op.value === v)) err('Choose one of the listed options');
        else values[fl.key] = v;
        break;
      }
      case 'multi_select': {
        if (!Array.isArray(v) || v.some((x) => !fl.options?.some((op) => op.value === x))) err('Choose from the listed options');
        else if (vd.maxSelected && v.length > vd.maxSelected) err(`Choose at most ${vd.maxSelected}`);
        else values[fl.key] = v;
        break;
      }
      case 'checkbox': case 'toggle': {
        if (v !== undefined && typeof v !== 'boolean') err('Must be yes or no');
        else values[fl.key] = v === true;
        break;
      }
      case 'date': {
        if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) err('Enter a valid date');
        else if (vd.minDate && v < vd.minDate) err(`Not before ${vd.minDate}`);
        else if (vd.maxDate && v > vd.maxDate) err(`Not after ${vd.maxDate}`);
        else values[fl.key] = v;
        break;
      }
      case 'image': case 'file': case 'images': {
        values[fl.key] = v; // upload handled by the existing secure upload service later (URLs only)
        break;
      }
    }
  }
  return { ok: Object.keys(errors).length === 0, errors, values };
}

// ---------- variants ----------
export const variantKey = (opts: Record<string, string>) =>
  Object.keys(opts).sort().map((k) => `${k}=${opts[k]}`).join('|');

/** Cartesian product of the selected option values per axis, in axis order. */
export function buildVariantCombos(axes: VariantAxis[], selected: Record<string, string[]>): Record<string, string>[] {
  let combos: Record<string, string>[] = [{}];
  for (const ax of axes) {
    const picks = (selected[ax.key] ?? []).filter((p) => ax.options.some((op) => op.value === p));
    if (!picks.length) continue;
    combos = combos.flatMap((cmb) => picks.map((p) => ({ ...cmb, [ax.key]: p })));
  }
  return Object.keys(combos[0] ?? {}).length ? combos : [];
}

export function findDuplicateVariants(rows: Record<string, string>[]): string[] {
  const seen = new Set<string>(); const dup: string[] = [];
  for (const r of rows) { const k = variantKey(r); if (seen.has(k)) dup.push(k); seen.add(k); }
  return dup;
}
