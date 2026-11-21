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

// ---------- type-ahead for "Choose your business" ----------
export interface TypeaheadHit { nodeId: string; name: string; path: string[]; score: number; reason: string }

/** Optimal-string-alignment distance (one swap counts as 1, so "pickel" is 1 away from "pickle"). */
function osa(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9'\s-]+/g, ' ').split(/\s+/).filter(Boolean);

/**
 * Suggest business types while the owner types (matches names, keywords, category and industry names; tolerates typos).
 * Runs on the live release, in the browser, so it responds on every keystroke.
 */
export function searchBusinessTypes(query: string, src: ConfigSource = SEED, limit = 6): TypeaheadHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const qw = words(q);
  const hits: TypeaheadHit[] = [];
  for (const n of src.taxonomy) {
    if (n.level !== 3 || !n.active) continue;
    const path = ancestorChain(n.id, src).map((x) => x.name);
    const name = n.name.toLowerCase(); const kws = (n.keywords ?? []).map((k) => k.toLowerCase());
    let score = 0; let reason = '';
    const bump = (s: number, r: string) => { if (s > score) { score = s; reason = r; } };
    if (name.startsWith(q)) bump(100, 'name');
    else if (name.includes(q)) bump(85, 'name');
    for (const k of kws) { if (k.startsWith(q)) bump(75, `“${k}”`); else if (k.includes(q)) bump(60, `“${k}”`); }
    for (const p of path.slice(0, -1)) if (p.toLowerCase().includes(q)) bump(45, p);
    if (score === 0) {
      // typo tolerance, word by word
      const pool = [...words(name), ...kws.flatMap(words)];
      for (const w of qw) if (w.length >= 4) for (const cand of pool) {
        const lim = w.length > 6 ? 2 : 1;
        if (Math.abs(cand.length - w.length) <= lim && osa(w, cand) <= lim) bump(50, `looks like “${cand}”`);
      }
    }
    if (score > 0) hits.push({ nodeId: n.id, name: n.name, path, score, reason });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
}
