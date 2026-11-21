// "What you can do" shown to an owner choosing a business type. Uses the Studio-written highlights when present,
// otherwise derives plain sentences from the configured menu so it is never empty.
import { resolveMenu } from './menu';
import { SEED, type ConfigSource } from './resolve-form';
import { CORE_MODULES } from '../templates';

export function capabilitiesFor(typeId: string, src: ConfigSource = SEED): string[] {
  const node = src.taxonomy.find((n) => n.id === typeId);
  if (node?.highlights?.length) return node.highlights;
  const menu = resolveMenu([typeId], src);
  const pick = (sec: string) => menu.find((s) => s.key === sec)?.items.filter((i) => !CORE_MODULES.includes(i.key)).map((i) => i.label) ?? [];
  const out: string[] = [];
  const sales = pick('sales').filter((l) => !/AI|Automation/i.test(l)); const cat = pick('catalogue');
  if (sales.length) out.push(`Manage your ${sales.slice(0, 3).join(', ')}`);
  if (cat.length) out.push(`Set up ${cat.slice(0, 3).join(', ')}`);
  if (menu.some((s) => s.items.some((i) => i.key === 'payments'))) out.push('Track payments');
  out.push('Reply to customers from one inbox');
  return out;
}
