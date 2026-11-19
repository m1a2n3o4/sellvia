import { TEMPLATES, CORE_MODULES, DEFAULT_PRODUCT_FIELDS } from './templates';
import type { FieldDef, BusinessTemplate, ModuleKey, TemplateKey, WorkflowDef } from './types';
import type { BusinessModel } from '../types';

export interface ResolvedModule { key: ModuleKey; label?: string; core: boolean; from: TemplateKey[] }

/**
 * Merge the modules of every template active on a tenant.
 * Rules: core modules are always present; a module is present if any template enables it;
 * the first template in the list (the primary one) that sets a label wins, so a resort's
 * "Guests" is not replaced by a later template.
 */
export function resolveModules(templateKeys: TemplateKey[]): Map<ModuleKey, ResolvedModule> {
  const out = new Map<ModuleKey, ResolvedModule>();
  CORE_MODULES.forEach((key) => out.set(key, { key, core: true, from: [] }));
  for (const tk of templateKeys) {
    const t = TEMPLATES[tk];
    if (!t) continue;
    for (const [k, cfg] of Object.entries(t.modules) as [ModuleKey, { label?: string }][]) {
      const cur = out.get(k) ?? { key: k, core: false, from: [] };
      cur.from.push(tk);
      if (!cur.label && cfg.label) cur.label = cfg.label;
      out.set(k, cur);
    }
  }
  return out;
}

export const getTemplates = (keys: TemplateKey[]): BusinessTemplate[] =>
  keys.map((k) => TEMPLATES[k]).filter(Boolean);

export const resolveBusinessModels = (keys: TemplateKey[]): BusinessModel[] =>
  Array.from(new Set(getTemplates(keys).flatMap((t) => t.businessModels)));

export const resolveWorkflows = (keys: TemplateKey[]): (WorkflowDef & { template: string })[] =>
  getTemplates(keys).flatMap((t) => t.workflows.map((w) => ({ ...w, template: t.name })));

/** Fields for a module's form: first active template that defines them, else a plain default. */
export function resolveFields(keys: TemplateKey[], module: ModuleKey): { label: string; fields: FieldDef[]; fromTemplate: boolean } {
  for (const t of getTemplates(keys)) {
    const g = t.fieldGroups.find((x) => x.module === module);
    if (g) return { label: g.label, fields: g.fields, fromTemplate: true };
  }
  return { label: 'Product fields', fields: [...DEFAULT_PRODUCT_FIELDS] as FieldDef[], fromTemplate: false };
}
