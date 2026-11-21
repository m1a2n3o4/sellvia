// Best-effort in-memory limiter (per server instance). Slows guessing; not a substitute for edge rate limiting.
const hits = new Map<string, number[]>();
export function tooMany(key: string, max = 8, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return arr.length > max;
}
export const clientIp = (h: Headers) => h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
