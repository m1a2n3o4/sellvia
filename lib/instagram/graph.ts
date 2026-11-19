import { IG_GRAPH } from './config';

export class GraphError extends Error {
  constructor(message: string, public status: number, public code?: number, public subcode?: number) { super(message); }
}

/** Graph call. The token goes in the Authorization header (never in the URL) and is never logged. */
export async function graph<T = any>(path: string, opts: { token?: string; method?: 'GET' | 'POST'; params?: Record<string, string>; json?: unknown } = {}): Promise<T> {
  const url = new URL(`${IG_GRAPH}/${path}`);
  Object.entries(opts.params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.json) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { method: opts.method || 'GET', headers, body: opts.json ? JSON.stringify(opts.json) : undefined, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    const e = data?.error || {};
    throw new GraphError(e.message || 'Graph error', res.status, e.code, e.error_subcode);
  }
  return data as T;
}

/** Sends a DM. Only works within 24h of the customer's last message. */
export async function sendInstagramText(igAccountId: string, token: string, recipientId: string, text: string) {
  return graph(`${igAccountId}/messages`, { method: 'POST', token, json: { recipient: { id: recipientId }, message: { text } } });
}
