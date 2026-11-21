// Menu resolver (Stage T3b). The business menu = default templates, then per-business-type overrides
// (enable/disable, rename, reorder, rename sections). Used by the owner's sidebar, onboarding and the Studio preview.
import { NAV, type NavItem, type VisibleSection } from '../../nav';
import { CORE_MODULES } from '../templates';
import { resolveModules } from '../resolve';
import type { ModuleKey, TemplateKey } from '../types';
import { ancestorChain, SEED, type ConfigSource } from './resolve-form';
import type { MenuConfig, MenuItemOverride } from './types';

export const MAX_LABEL = 32;

/** Every menu item the platform can show, with its section. Labels here are only defaults. */
export const MENU_CATALOGUE: { section: string; sectionLabel: string; items: NavItem[] }[] =
  NAV.map((s) => ({ section: s.key, sectionLabel: s.label, items: s.items }));

export function templatesFor(typeIds: string[], src: ConfigSource = SEED): TemplateKey[] {
  const out: TemplateKey[] = [];
  for (const id of typeIds) for (const t of src.taxonomy.find((n) => n.id === id)?.defaultTemplates ?? []) if (!out.includes(t)) out.push(t);
  return out;
}

/** Overrides merged along each type's ancestor chain (root first); the primary type is applied last so it wins. */
export function mergedMenuConfig(typeIds: string[], src: ConfigSource = SEED): Required<MenuConfig> {
  const items: Partial<Record<ModuleKey, MenuItemOverride>> = {}; const sections: Record<string, string> = {};
  for (const id of [...typeIds].reverse()) {
    let chain: { id: string }[] = [];
    try { chain = ancestorChain(id, src); } catch { continue; }
    for (const n of chain) {
      const m = src.menus?.[n.id]; if (!m) continue;
      for (const [k, v] of Object.entries(m.items ?? {}) as [ModuleKey, MenuItemOverride][]) items[k] = { ...items[k], ...v };
      Object.assign(sections, m.sections ?? {});
    }
  }
  return { items, sections };
}

export function resolveMenu(typeIds: string[], src: ConfigSource = SEED): VisibleSection[] {
  const mods = resolveModules(templatesFor(typeIds, src));
  const { items, sections } = mergedMenuConfig(typeIds, src);
  return NAV.map((sec) => {
    const list = sec.items
      .map((it, idx) => ({ it, idx, o: items[it.key] }))
      .filter(({ it, o }) => (o?.enabled === false ? CORE_MODULES.includes(it.key) : o?.enabled === true ? true : mods.has(it.key)))
      .sort((a, b) => (a.o?.order ?? a.idx) - (b.o?.order ?? b.idx))
      .map(({ it, o }) => ({ ...it, label: o?.label?.trim() || mods.get(it.key)?.label || it.label }));
    return { key: sec.key, label: sections[sec.key]?.trim() || sec.label, items: list };
  }).filter((s) => s.items.length > 0);
}

/** The label a module would have without any menu override (templates only). */
export function baseLabel(typeIds: string[], key: ModuleKey, src: ConfigSource = SEED): string {
  const mods = resolveModules(templatesFor(typeIds, src));
  return mods.get(key)?.label ?? NAV.flatMap((s) => s.items).find((i) => i.key === key)?.label ?? key;
}
export const isCore = (key: ModuleKey) => CORE_MODULES.includes(key);
