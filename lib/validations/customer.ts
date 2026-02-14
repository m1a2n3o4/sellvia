import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  name: z.string().min(1, 'Name is required').max(200).optional(),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits').optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
