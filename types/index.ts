export interface User {
  id: string;
  mobile: string;
  businessName: string;
  tenantId: string;
  features: {
    inventory: boolean;
    orders: boolean;
    customers: boolean;
    broadcasting: boolean;
    whatsapp: boolean;
  };
}

export interface Admin {
  id: string;
  username: string;
}

export interface Tenant {
  id: string;
  clientName: string;
  businessName: string;
  mobile: string;
  address: string;
  status: 'active' | 'inactive';
  features: {
    inventory: boolean;
    orders: boolean;
    customers: boolean;
    broadcasting: boolean;
    whatsapp: boolean;
  };
  createdAt: string;
}

export type OrderType = 'online' | 'offline';
export type DeliveryStatus = 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'returned';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  basePrice: number;
  sku?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  status: 'active' | 'inactive';
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  variantName: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  orderType: OrderType;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'failed' | 'refunded';
  deliveryAddress?: string;
  deliveryStatus: DeliveryStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  orderItems?: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  recentOrders: Order[];
}
