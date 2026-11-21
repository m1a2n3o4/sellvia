// Product rules for owners on the configured platform (T5). Server only.
// The schema comes from the LIVE release and the owner's own business types; the tenant comes from the login cookie.
import { getLiveConfig, getTenantBusiness } from '@/lib/config/server';
import { findDuplicateVariants, flatFields, resolveFormSchema, validateValues, variantKey } from '@/lib/crm/config/taxonomy/resolve-form';
import type { ResolvedFormSchema } from '@/lib/crm/config/taxonomy/types';

/** Form keys stored in real `products` columns. Everything else goes to `product_extras.attributes`. */
export const CORE_COLUMN_KEYS = ['name', 'description', 'price', 'sku', 'stock', 'images', 'brand'] as const;

export interface VariantInput { options: Record<string, string>; price: number; stock: number; sku?: string }
export interface ProductInput {
  businessTypeId: string; configVersion: number; schema: ResolvedFormSchema;
  columns: { name: string; description: string | null; basePrice: number; sku: string | null; stockQuantity: number; brand: string | null };
  attributes: Record<string, unknown>;
  variants: VariantInput[];
}
export type Checked = { ok: true; input: ProductInput } | { ok: false; status: number; error: string; fields?: Record<string, string> };

export async function checkProductBody(tenantId: string, body: unknown): Promise<Checked> {
  const b = (body ?? {}) as { businessTypeId?: unknown };
  const [live, biz] = await Promise.all([getLiveConfig(), getTenantBusiness(tenantId)]);
  if (typeof b.businessTypeId !== 'string' || !biz.businessTypes.includes(b.businessTypeId)) return { ok: false, status: 400, error: 'Choose one of your business types' };
  let schema: ResolvedFormSchema;
  try { schema = resolveFormSchema(b.businessTypeId, live.config, live.version); } catch { return { ok: false, status: 400, error: 'This business type is no longer available' }; }
  return checkAgainstSchema(schema, b.businessTypeId, live.version, body);
}

/** Pure part (unit tested): validate a product body against an already resolved schema. */
export function checkAgainstSchema(schema: ResolvedFormSchema, businessTypeId: string, configVersion: number, body: unknown): Checked {
  const b = (body ?? {}) as { values?: unknown; variants?: unknown };

  const values = b.values && typeof b.values === 'object' && !Array.isArray(b.values) ? (b.values as Record<string, unknown>) : {};
  const r = validateValues(schema, values);
  const fields: Record<string, string> = { ...r.errors };

  // variants
  const axes = schema.variants.axes;
  const rawV = Array.isArray(b.variants) ? b.variants : [];
  const variants: VariantInput[] = [];
  if (!axes.length && rawV.length) fields.variants = 'This business type does not use variants';
  if (rawV.length > 200) fields.variants = 'Too many variants (maximum 200)';
  rawV.slice(0, 200).forEach((raw, i) => {
    const v = (raw ?? {}) as { options?: Record<string, unknown>; price?: unknown; stock?: unknown; sku?: unknown };
    const opts: Record<string, string> = {};
    for (const ax of axes) {
      const pick = v.options?.[ax.key];
      if (typeof pick === 'string' && ax.options.some((o) => o.value === pick)) opts[ax.key] = pick;
    }
    const price = Number(v.price); const stock = v.stock === '' || v.stock === undefined ? 0 : Number(v.stock);
    if (!Object.keys(opts).length) fields[`variant:${i}`] = 'Choose at least one option';
    else if (!Number.isFinite(price) || price < 0) fields[`variant:${variantKey(opts)}`] = 'Price needed';
    else if (!Number.isInteger(stock) || stock < 0) fields[`variant:${variantKey(opts)}`] = 'Stock must be a whole number';
    else variants.push({ options: opts, price, stock, sku: typeof v.sku === 'string' && v.sku.trim() ? v.sku.trim().slice(0, 60) : undefined });
  });
  if (findDuplicateVariants(variants.map((x) => x.options)).length) fields.variants = 'Duplicate variant combination';
  if (Object.keys(fields).length) return { ok: false, status: 422, error: 'Please fix the highlighted fields', fields };

  const v = r.values;
  const attributes: Record<string, unknown> = {};
  for (const f of flatFields(schema)) if (!(CORE_COLUMN_KEYS as readonly string[]).includes(f.key) && v[f.key] !== undefined) attributes[f.key] = v[f.key];
  const stock = variants.length ? variants.reduce((n, x) => n + x.stock, 0) : Number(v.stock ?? 0);
  return {
    ok: true,
    input: {
      businessTypeId, configVersion, schema,
      columns: {
        name: String(v.name), description: typeof v.description === 'string' && v.description ? v.description : null,
        basePrice: Number(v.price), sku: typeof v.sku === 'string' && v.sku ? v.sku : null, stockQuantity: Number.isFinite(stock) ? stock : 0,
        brand: typeof v.brand === 'string' && v.brand ? v.brand : null,
      },
      attributes, variants,
    },
  };
}

export const labelFor = (schema: ResolvedFormSchema, opts: Record<string, string>) =>
  schema.variants.axes.map((a) => a.options.find((o) => o.value === opts[a.key])?.label).filter(Boolean).join(' / ');
