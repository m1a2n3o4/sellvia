export type SatyaSellField =
  | 'name'
  | 'basePrice'
  | 'category'
  | 'stockQuantity'
  | 'sku'
  | 'brand'
  | 'description'
  | 'variantName'
  | 'variantAttribute'
  | 'skip';

export interface ImportProduct {
  name: string;
  basePrice: number;
  brand?: string;
  description?: string;
  category?: string;
  sku?: string;
  stockQuantity: number;
  variants?: ImportVariant[];
}

export interface ImportVariant {
  variantName: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface ValidatedRow {
  rowIndex: number;
  status: 'valid' | 'warning' | 'error';
  issues: string[];
  data: ImportProduct;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

export type ColumnMappings = Record<string, SatyaSellField>;

// ─── Auto-matching column headers ───────────────────────────

const FIELD_PATTERNS: Record<SatyaSellField, RegExp[]> = {
  name: [/^(product\s*)?name$/i, /^title$/i, /^product$/i, /^item$/i, /^item\s*name$/i, /^product\s*title$/i],
  basePrice: [/^(base\s*)?price$/i, /^mrp$/i, /^cost$/i, /^rate$/i, /^amount$/i, /^selling\s*price$/i, /^sp$/i],
  category: [/^category$/i, /^type$/i, /^group$/i, /^product\s*type$/i, /^item\s*category$/i],
  stockQuantity: [/^stock$/i, /^qty$/i, /^quantity$/i, /^available$/i, /^stock\s*qty$/i, /^stock\s*quantity$/i, /^inventory$/i],
  sku: [/^sku$/i, /^code$/i, /^item\s*code$/i, /^barcode$/i, /^product\s*code$/i, /^article$/i],
  brand: [/^brand$/i, /^manufacturer$/i, /^brand\s*name$/i, /^company$/i],
  description: [/^description$/i, /^details$/i, /^info$/i, /^product\s*description$/i, /^about$/i],
  variantName: [/^size$/i, /^variant$/i, /^variant\s*name$/i, /^option$/i],
  variantAttribute: [/^color$/i, /^colour$/i, /^shade$/i],
  skip: [],
};

export function autoMatchColumns(headers: string[]): Record<string, SatyaSellField> {
  const matched: Record<string, SatyaSellField> = {};
  const usedFields = new Set<SatyaSellField>();

  for (const header of headers) {
    const trimmed = header.trim();
    for (const [field, patterns] of Object.entries(FIELD_PATTERNS) as [SatyaSellField, RegExp[]][]) {
      if (field === 'skip' || usedFields.has(field)) continue;
      if (patterns.some(p => p.test(trimmed))) {
        matched[header] = field;
        usedFields.add(field);
        break;
      }
    }
    if (!matched[header]) {
      matched[header] = 'skip';
    }
  }

  return matched;
}

// ─── Auto-fix values ────────────────────────────────────────

function cleanPrice(raw: string): number {
  // Remove currency symbols and whitespace
  let cleaned = raw.replace(/[₹$€£]/g, '').trim();
  // Remove "Rs", "Rs.", "INR" prefixes
  cleaned = cleaned.replace(/^(rs\.?|inr)\s*/i, '');
  // Remove commas (handles both 1,299 and 1,00,000)
  cleaned = cleaned.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
}

function cleanStock(raw: string): number {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'n/a' || trimmed === 'na' || trimmed === '-' || trimmed === 'null') {
    return 0;
  }
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

// ─── Row validation ─────────────────────────────────────────

export function applyMappings(
  row: Record<string, string>,
  mappings: ColumnMappings
): Record<SatyaSellField, string> {
  const result: Record<string, string> = {};
  for (const [header, field] of Object.entries(mappings)) {
    if (field !== 'skip') {
      result[field] = row[header] ?? '';
    }
  }
  return result as Record<SatyaSellField, string>;
}

export function validateRow(
  mappedRow: Record<string, string>,
  rowIndex: number,
  seenSkus: Set<string>,
  existingSkus: Set<string>
): ValidatedRow {
  const issues: string[] = [];
  let status: 'valid' | 'warning' | 'error' = 'valid';

  // Extract & clean values
  const name = (mappedRow.name ?? '').trim();
  const priceRaw = mappedRow.basePrice ?? '';
  const price = cleanPrice(priceRaw);
  const stockRaw = mappedRow.stockQuantity ?? '';
  const stock = cleanStock(stockRaw);
  const sku = (mappedRow.sku ?? '').trim() || undefined;
  const brand = (mappedRow.brand ?? '').trim() || undefined;
  const description = (mappedRow.description ?? '').trim() || undefined;
  const category = (mappedRow.category ?? '').trim() || undefined;

  // ERROR checks
  if (!name) {
    issues.push('Product name is required');
    status = 'error';
  }

  if (priceRaw.trim() === '' || isNaN(price)) {
    issues.push('Price is required and must be a number');
    status = 'error';
  } else if (price < 0) {
    issues.push('Price cannot be negative');
    status = 'error';
  }

  // WARNING checks (only if no errors)
  if (status !== 'error') {
    if (price === 0) {
      issues.push('Price is 0');
      status = 'warning';
    }

    let finalName = name;
    if (name.length > 200) {
      finalName = name.substring(0, 200);
      issues.push('Name truncated to 200 characters');
      status = 'warning';
    }

    let finalStock = stock;
    if (stock < 0) {
      finalStock = 0;
      issues.push('Negative stock set to 0');
      status = 'warning';
    }

    if (sku) {
      if (seenSkus.has(sku.toLowerCase())) {
        issues.push('Duplicate SKU in file');
        status = 'warning';
      }
      if (existingSkus.has(sku.toLowerCase())) {
        issues.push('SKU already exists in your products');
        status = 'warning';
      }
      seenSkus.add(sku.toLowerCase());
    }

    return {
      rowIndex,
      status,
      issues,
      data: {
        name: finalName,
        basePrice: price,
        brand,
        description,
        category,
        sku,
        stockQuantity: finalStock,
      },
    };
  }

  // Return error row with best-effort data
  return {
    rowIndex,
    status: 'error',
    issues,
    data: {
      name: name || '(missing)',
      basePrice: isNaN(price) ? 0 : price,
      brand,
      description,
      category,
      sku,
      stockQuantity: Math.max(0, stock),
    },
  };
}

// ─── Variant grouping ───────────────────────────────────────

export function hasVariantMapping(mappings: ColumnMappings): boolean {
  return Object.values(mappings).includes('variantName');
}

export function groupVariants(
  validatedRows: ValidatedRow[],
  mappedRows: Record<string, string>[],
  mappings: ColumnMappings
): ValidatedRow[] {
  // Only group rows that are valid or warning (skip errors)
  const validRows = validatedRows.filter(r => r.status !== 'error');
  const errorRows = validatedRows.filter(r => r.status === 'error');

  // Find variant column names
  const variantNameHeader = Object.entries(mappings).find(([, f]) => f === 'variantName')?.[0];
  const variantAttrHeader = Object.entries(mappings).find(([, f]) => f === 'variantAttribute')?.[0];

  if (!variantNameHeader) return validatedRows;

  // Group by product name (case-insensitive, trimmed)
  const groups = new Map<string, { rows: ValidatedRow[]; rawRows: Record<string, string>[] }>();

  for (const row of validRows) {
    const key = row.data.name.toLowerCase().trim();
    const existing = groups.get(key) || { rows: [], rawRows: [] };
    existing.rows.push(row);
    existing.rawRows.push(mappedRows[row.rowIndex] || {});
    groups.set(key, existing);
  }

  const grouped: ValidatedRow[] = [];

  for (const [, group] of groups) {
    const firstRow = group.rows[0];
    const variants: ImportVariant[] = [];

    for (let i = 0; i < group.rows.length; i++) {
      const raw = group.rawRows[i];
      const row = group.rows[i];

      const variantName = (raw[variantNameHeader] ?? '').trim();
      const variantAttr = variantAttrHeader ? (raw[variantAttrHeader] ?? '').trim() : '';

      if (!variantName && !variantAttr) continue;

      const attributes: Record<string, string> = {};
      if (variantName) attributes[variantNameHeader] = variantName;
      if (variantAttr && variantAttrHeader) attributes[variantAttrHeader] = variantAttr;

      const displayName = [variantName, variantAttr].filter(Boolean).join(' / ');

      variants.push({
        variantName: displayName || variantName,
        price: row.data.basePrice,
        stockQuantity: row.data.stockQuantity,
        attributes,
      });
    }

    // Use lowest price as basePrice
    const basePrice = variants.length > 0
      ? Math.min(...variants.map(v => v.price))
      : firstRow.data.basePrice;

    // Sum stock across all variants
    const totalStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + v.stockQuantity, 0)
      : firstRow.data.stockQuantity;

    // Collect all issues
    const allIssues = group.rows.flatMap(r => r.issues);
    const worstStatus = group.rows.some(r => r.status === 'warning') ? 'warning' : 'valid';

    grouped.push({
      rowIndex: firstRow.rowIndex,
      status: worstStatus,
      issues: [...new Set(allIssues)],
      data: {
        ...firstRow.data,
        basePrice,
        stockQuantity: totalStock,
        variants: variants.length > 0 ? variants : undefined,
      },
    });
  }

  return [...grouped, ...errorRows];
}

// ─── Validation summary ─────────────────────────────────────

export function calculateSummary(rows: ValidatedRow[]): ValidationSummary {
  return {
    total: rows.length,
    valid: rows.filter(r => r.status === 'valid').length,
    warnings: rows.filter(r => r.status === 'warning').length,
    errors: rows.filter(r => r.status === 'error').length,
  };
}
