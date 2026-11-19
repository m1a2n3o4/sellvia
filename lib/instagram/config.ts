// Instagram "Unified login" (Facebook Login for Business with a config ID) settings.
// Secrets come from env only. The Instagram app ("SatyaSell Social") is a DIFFERENT Meta app from the WhatsApp
// app, so it has its own IG_APP_SECRET. It never falls back to META_APP_SECRET (that is WhatsApp's secret).
// Encryption reuses lib/crypto/secrets (ENCRYPTION_KEY, AES-256-GCM).

export const IG_GRAPH_VERSION = process.env.IG_GRAPH_VERSION || 'v26.0';
export const IG_GRAPH = `https://graph.facebook.com/${IG_GRAPH_VERSION}`;

export interface IgConfig { appId: string; appSecret: string; configId: string; redirectUri: string; stateSecret: string }

/** Returns the config, or the names of missing env vars. Routes answer 503 instead of crashing when unconfigured. */
export function getIgConfig(): { ok: true; cfg: IgConfig } | { ok: false; missing: string[] } {
  const cfg = {
    appId: process.env.IG_APP_ID || process.env.META_APP_ID || '',
    appSecret: process.env.IG_APP_SECRET || '',
    configId: process.env.IG_CONFIG_ID || process.env.META_CONFIG_ID || '',
    redirectUri: process.env.IG_REDIRECT_URI || '',
    stateSecret: process.env.STATE_SECRET || '',
  };
  const names: Record<keyof IgConfig, string> = { appId: 'IG_APP_ID', appSecret: 'IG_APP_SECRET', configId: 'IG_CONFIG_ID', redirectUri: 'IG_REDIRECT_URI', stateSecret: 'STATE_SECRET' };
  const missing = (Object.keys(cfg) as (keyof IgConfig)[]).filter((k) => !cfg[k]).map((k) => names[k]);
  return missing.length ? { ok: false, missing } : { ok: true, cfg };
}

export const getVerifyToken = () => (process.env.IG_VERIFY_TOKEN || '').trim();
