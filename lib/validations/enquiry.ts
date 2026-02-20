import { z } from 'zod';

export const createEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  instagramLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
