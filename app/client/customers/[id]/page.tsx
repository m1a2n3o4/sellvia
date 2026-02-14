'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Customer, Order } from '@/types';

interface CustomerWithOrders extends Customer {
  orders?: Order[];
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<CustomerWithOrders | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/client/customers/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setCustomer(data);
      } catch {
        console.error('Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    await fetch(`/api/client/customers/${params.id}`, { method: 'DELETE' });
    router.push('/client/customers');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-neutral-400">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/client/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const orderColumns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (o: Order) => <span className="font-medium">{o.orderNumber}</span>,
    },
    {
      key: 'orderDate',
      header: 'Date',
      render: (o: Order) => new Date(o.orderDate).toLocaleDateString(),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: Order) => <span>&#8377;{Number(o.total).toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => (
        <Badge variant={o.status === 'delivered' ? 'default' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (o: Order) => (
        <Badge variant={o.paymentStatus === 'paid' ? 'default' : 'secondary'}>
          {o.paymentStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/client/customers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{customer.mobile}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Mobile</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{customer.mobile}</p>
          </div>
          {customer.email && (
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Email</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{customer.email}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Total Orders</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{customer.totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase">Total Spent</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              &#8377;{Number(customer.totalSpent).toLocaleString()}
            </p>
          </div>
        </div>
        {(customer.address || customer.city || customer.state) && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase mb-1">Address</p>
            <p className="text-sm text-gray-700 dark:text-neutral-300">
              {[customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
        {customer.notes && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700 dark:text-neutral-300">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Customer's Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order History</h2>
        <DataTable
          columns={orderColumns}
          data={customer.orders || []}
          emptyMessage="No orders from this customer yet."
          keyExtractor={(o) => o.id}
          onRowClick={(o) => router.push(`/client/orders/${o.id}`)}
        />
      </div>
    </div>
  );
}
