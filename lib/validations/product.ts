import { z } from 'zod';

const variantSchema = z.object({
  variantName: z.string().min(1, 'Variant name is required'),
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock must be non-negative'),
  attributes: z.record(z.string(), z.string()).default({}),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  basePrice: z.number().min(0, 'Base price must be positive'),
  sku: z.string().optional(),
  stockQuantity: z.number().int().min(0, 'Stock must be non-negative').default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  images: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  variants: z.array(variantSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
