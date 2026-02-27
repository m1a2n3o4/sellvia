import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID required'),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).max(99),
  })).min(1, 'Cart cannot be empty').max(20, 'Maximum 20 items per order'),
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  customerPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  customerEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  deliveryAddress: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address is too long'),
  city: z.string()
    .min(2, 'Enter a valid city name')
    .max(100),
  state: z.string()
    .min(2, 'Enter a valid state name')
    .max(100),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  paymentMethod: z.enum(['cod', 'online']),
  honeypot: z.string().max(0).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
