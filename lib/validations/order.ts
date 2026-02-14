import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  productName: z.string().min(1),
  variantName: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerMobile: z.string().regex(/^\d{10}$/, 'Mobile must be exactly 10 digits'),
  orderType: z.enum(['online', 'offline']).default('offline'),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'pending', 'failed', 'refunded']).default('unpaid'),
  deliveryAddress: z.string().optional(),
  discount: z.number().min(0).default(0),
  shippingFee: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'pending', 'failed', 'refunded']).optional(),
  deliveryStatus: z.enum(['pending', 'dispatched', 'in_transit', 'delivered', 'returned']).optional(),
  paymentMethod: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  cancelledReason: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
