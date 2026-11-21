// Release checks and impact summary for the Studio (Stage T3). Pure functions, unit tested.
import { resolveFormSchema, flatFields, type ConfigSource } from './resolve-form';
import type { ResolvedField } from './types';
import { MAX_LABEL, MENU_CATALOGUE } from './menu';

export interface Issue { level: 'error' | 'warning'; message: string }
const KEY_RE = /^[a-z][a-z0-9_]{1,40}$/;
const CHOICE = new Set(['select', 'radio', 'multi_select']);

export function validateConfig(src: ConfigSource): Issue[] {
  const issues: Issue[] = [];
  const err = (m: string) => issues.push({ level: 'error', message: m });
  const warn = (m: string) => issues.push({ level: 'warning', message: m });

  const keys = new Map<string, string>();
  for (const f of src.fields) {
    if (!KEY_RE.test(f.key)) err(`Field "${f.label}": key "${f.key}" must be lowercase snake_case.`);
    if (keys.has(f.key)) err(`Field key "${f.key}" is used twice.`);
    keys.set(f.key, f.id);
    if (CHOICE.has(f.type) && !(f.options?.length)) err(`Field "${f.label}" needs at least one option.`);
    if (f.type === 'measurement' && !(f.validation?.units?.length || f.unit)) err(`Field "${f.label}" needs at least one unit.`);
    const o = f.options?.map((x) => x.value) ?? [];
    if (new Set(o).size !== o.length) err(`Field "${f.label}" has duplicate option values.`);
  }
  const seenSlug = new Set<string>();
  for (const n of src.taxonomy) {
    const k = `${n.parentId}/${n.name.toLowerCase()}`;
    if (seenSlug.has(k)) err(`Two entries named "${n.name}" under the same parent.`);
    seenSlug.add(k);
    if (n.level === 3 && n.active && !(n.keywords?.length)) warn(`"${n.name}" has no recognition keywords, so it can only be chosen manually.`);
    if (n.level === 3 && n.active && !n.defaultTemplates.length) warn(`"${n.name}" has no default template, so owners get the standard menu.`);
  }
  const fieldIds = new Set(src.fields.map((f) => f.id));
  const nodeIds = new Set(src.taxonomy.map((n) => n.id));
  const seenMap = new Set<string>();
  for (const m of src.mappings) {
    if (!fieldIds.has(m.fieldId)) err(`A mapping points to a field that no longer exists (${m.fieldId}).`);
    if (m.scope !== 'global' && !(m.scopeId && nodeIds.has(m.scopeId))) err(`A mapping for ${m.fieldId} points to a missing category.`);
    const k = `${m.fieldId}|${m.scope}|${m.scopeId ?? ''}`;
    if (seenMap.has(k)) err(`Field ${m.fieldId} is mapped twice at the same level.`);
    seenMap.add(k);
  }
  const modKeys = new Set(MENU_CATALOGUE.flatMap((c) => c.items.map((i) => i.key as string)));
  const secKeys = new Set(MENU_CATALOGUE.map((c) => c.section));
  for (const [nid, mc] of Object.entries(src.menus ?? {})) {
    if (!nodeIds.has(nid)) { err(`A menu setting points to a missing category (${nid}).`); continue; }
    for (const [k, o] of Object.entries(mc.items ?? {})) {
      if (!modKeys.has(k)) err(`Menu for ${nid}: unknown menu item "${k}".`);
      if (o?.label !== undefined && (o.label.trim().length === 0 || o.label.length > MAX_LABEL)) err(`Menu for ${nid}: the label for "${k}" must be 1 to ${MAX_LABEL} characters.`);
    }
    for (const [k, l] of Object.entries(mc.sections ?? {})) {
      if (!secKeys.has(k)) err(`Menu for ${nid}: unknown section "${k}".`);
      if (l.trim().length === 0 || l.length > MAX_LABEL) err(`Menu for ${nid}: section "${k}" label must be 1 to ${MAX_LABEL} characters.`);
    }
  }
  for (const n of src.taxonomy.filter((x) => x.level === 3 && x.active)) {
    try { resolveFormSchema(n.id, src).warnings.forEach((w) => warn(`${n.name}: ${w}`)); }
    catch (e) { err(`${n.name}: ${(e as Error).message}`); }
  }
  return issues;
}

export interface Impact { typeId: string; typeName: string; added: string[]; removed: string[]; newlyRequired: string[] }

/** What changes for each business type between the live release and the draft. Warn before publishing breaking changes. */
export function impactOf(prev: ConfigSource, next: ConfigSource): Impact[] {
  const out: Impact[] = [];
  for (const n of next.taxonomy.filter((x) => x.level === 3 && x.active)) {
    let a: ResolvedField[]; let b: ResolvedField[];
    try { b = flatFields(resolveFormSchema(n.id, next)); } catch { continue; }
    try { a = flatFields(resolveFormSchema(n.id, prev)); } catch { a = []; }
    const am = new Map(a.map((f) => [f.key, f])); const bm = new Map(b.map((f) => [f.key, f]));
    const added = b.filter((f) => !am.has(f.key)).map((f) => f.label);
    const removed = a.filter((f) => !bm.has(f.key)).map((f) => f.label);
    const newlyRequired = b.filter((f) => f.required && am.has(f.key) && !am.get(f.key)!.required).map((f) => f.label);
    const addedRequired = b.filter((f) => f.required && !am.has(f.key)).map((f) => f.label);
    if (added.length || removed.length || newlyRequired.length) out.push({ typeId: n.id, typeName: n.name, added, removed, newlyRequired: [...newlyRequired, ...addedRequired] });
  }
  return out;
}

export const sameConfig = (a: ConfigSource, b: ConfigSource) => JSON.stringify(a) === JSON.stringify(b);
