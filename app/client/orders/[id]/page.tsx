'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Order } from '@/types';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/client/orders/${params.id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setOrder(data);
    } catch {
      console.error('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleUpdate = async (field: string, value: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/client/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch {
      console.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-neutral-400">Order not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/client/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': case 'paid': return 'default';
      case 'cancelled': case 'failed': case 'returned': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/client/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {new Date(order.orderDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              {' '}
              <Badge variant="outline" className="ml-1">{order.orderType}</Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Status Controls */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-neutral-400 mb-4 uppercase">Update Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-neutral-400">Order Status</label>
            <Select
              value={order.status}
              onValueChange={(v) => handleUpdate('status', v)}
              disabled={updating || order.status === 'cancelled'}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-neutral-400">Payment Status</label>
            <Select
              value={order.paymentStatus}
              onValueChange={(v) => handleUpdate('paymentStatus', v)}
              disabled={updating}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-neutral-400">Delivery Status</label>
            <Select
              value={order.deliveryStatus}
              onValueChange={(v) => handleUpdate('deliveryStatus', v)}
              disabled={updating}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Customer</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{order.customer?.name}</p>
            <p className="text-xs text-gray-500">{order.customer?.mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Order Status</p>
            <Badge variant={statusColor(order.status)} className="mt-1">{order.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Payment</p>
            <Badge variant={statusColor(order.paymentStatus)} className="mt-1">{order.paymentStatus}</Badge>
            {order.paymentMethod && (
              <p className="text-xs text-gray-500 mt-1">{order.paymentMethod}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Delivery</p>
            <Badge variant={statusColor(order.deliveryStatus)} className="mt-1">{order.deliveryStatus}</Badge>
          </div>
        </div>

        {order.deliveryAddress && (
          <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase mb-1">Delivery Address</p>
            <p className="text-sm text-gray-700 dark:text-neutral-300">{order.deliveryAddress}</p>
          </div>
        )}

        {/* Items */}
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Items</h3>
        <div className="space-y-2">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                <p className="text-xs text-gray-500">Qty: {item.quantity} x &#8377;{Number(item.price).toLocaleString()}</p>
              </div>
              <span className="text-sm font-medium">&#8377;{Number(item.subtotal).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>&#8377;{Number(order.subtotal).toLocaleString()}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">-&#8377;{Number(order.discount).toLocaleString()}</span>
            </div>
          )}
          {Number(order.shippingFee) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>&#8377;{Number(order.shippingFee).toLocaleString()}</span>
            </div>
          )}
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span>&#8377;{Number(order.tax).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span>Total</span>
            <span>&#8377;{Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
          <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase mb-1">Notes</p>
          <p className="text-sm text-gray-700 dark:text-neutral-300">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
