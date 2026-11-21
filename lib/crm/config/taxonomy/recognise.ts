// Business recognition (Stage T3). Deterministic keyword matching against the taxonomy.
// Used by (1) Instagram onboarding (profile name + bio), (2) manual "Choose your business", (3) the Studio tester.
// It NEVER silently picks: low confidence or a tie returns decision 'ask' so the owner confirms.
import { SEED, ancestorChain, type ConfigSource } from './resolve-form';

export interface Suggestion { nodeId: string; name: string; path: string[]; score: number; matched: string[] }
export interface Recognition {
  decision: 'confident' | 'ask' | 'none';
  suggestions: Suggestion[];
  /** Plain-language reason, shown to admins and owners. */
  note: string;
}

const norm = (t: string) => ` ${t.toLowerCase().replace(/[^a-z0-9'\s-]+/g, ' ').replace(/\s+/g, ' ').trim()} `;

function hits(text: string, kw: string): boolean {
  const k = norm(kw).trim();
  if (!k) return false;
  // whole-word / phrase match; allow a plural "s" so "pickle" matches "pickles".
  return text.includes(` ${k} `) || text.includes(` ${k}s `);
}

/** `name` counts double: a business called "Amma's Pickles" is strong evidence. */
export function recogniseBusiness(input: { name?: string; text?: string }, src: ConfigSource = SEED): Recognition {
  const nameT = norm(input.name ?? ''); const bodyT = norm(input.text ?? '');
  if (nameT.trim() === '' && bodyT.trim() === '') return { decision: 'none', suggestions: [], note: 'Nothing to analyse yet.' };

  const found: Suggestion[] = [];
  for (const n of src.taxonomy) {
    if (n.level !== 3 || !n.active) continue;
    const words = Array.from(new Set([...(n.keywords ?? []), n.name.toLowerCase()]));
    const matched: string[] = []; let score = 0;
    for (const w of words) {
      const inName = hits(nameT, w); const inBody = hits(bodyT, w);
      if (inName || inBody) { matched.push(w); score += (inName ? 2 : 0) + (inBody ? 1 : 0); }
    }
    if (score > 0) {
      const path = ancestorChain(n.id, src).map((x) => x.name);
      found.push({ nodeId: n.id, name: n.name, path, score, matched });
    }
  }
  found.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = found.slice(0, 4);
  if (!top.length) return { decision: 'none', suggestions: [], note: 'No business type matched. Ask the owner to choose one.' };

  const [a, b] = top;
  const clear = a.score >= 2 && (!b || a.score >= b.score * 2);
  return clear
    ? { decision: 'confident', suggestions: top, note: `Strong match on: ${a.matched.join(', ')}. The owner still confirms before setup.` }
    : { decision: 'ask', suggestions: top, note: 'More than one plausible type or weak evidence. Ask the owner to pick.' };
}
