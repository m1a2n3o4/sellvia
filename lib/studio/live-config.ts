'use client';
// The configuration release owners run on. PROTOTYPE: read from the Studio's browser-local release.
// T4 replaces this with the published release loaded from the database on the server.
import { SEED, type ConfigSource } from '@/lib/crm/config/taxonomy/resolve-form';

export function loadLiveConfig(): { cfg: ConfigSource; version: number } {
  try {
    const p = JSON.parse(localStorage.getItem('studio.config.v1') ?? 'null');
    const last = p?.releases?.[p.releases.length - 1];
    if (last?.snapshot) return { cfg: last.snapshot as ConfigSource, version: last.version };
  } catch { /* storage unavailable */ }
  return { cfg: SEED, version: 1 };
}
