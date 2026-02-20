'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateOfflineOrderModal } from '@/components/client/create-offline-order-modal';
import { Plus, Search } from 'lucide-react';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [today, setToday] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (orderType !== 'all') params.set('orderType', orderType);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (deliveryFilter !== 'all') params.set('deliveryStatus', deliveryFilter);
      if (today) params.set('today', 'true');
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/client/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, orderType, statusFilter, paymentFilter, deliveryFilter, today, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (o: Order) => <span className="font-medium">{o.orderNumber}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o: Order) => (
        <div>
          <p className="text-sm">{o.customer?.name || '-'}</p>
          <p className="text-xs text-gray-700">{o.customer?.mobile}</p>
        </div>
      ),
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (o: Order) => (
        <Badge variant={o.orderType === 'online' ? 'default' : 'outline'}>
          {o.orderType}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: Order) => <span>&#8377;{Number(o.total).toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => <Badge variant={statusColor(o.status)}>{o.status}</Badge>,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (o: Order) => (
        <Badge variant={o.paymentStatus === 'paid' ? 'default' : o.paymentStatus === 'failed' ? 'destructive' : 'secondary'}>
          {o.paymentStatus}
        </Badge>
      ),
    },
    {
      key: 'orderDate',
      header: 'Date',
      render: (o: Order) => (
        <span className="text-xs text-gray-700">
          {new Date(o.orderDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-700 dark:text-neutral-400 mt-1">
            Manage all your orders
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
          <Select value={orderType} onValueChange={(v) => { setOrderType(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid / COD</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deliveryFilter} onValueChange={(v) => { setDeliveryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={today ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setToday(!today); setDateFrom(''); setDateTo(''); setPage(1); }}
          >
            Today
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <DatePicker
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setToday(false); setPage(1); }}
              className="w-[150px] h-9"
            />
            <span className="text-sm text-gray-700">to</span>
            <DatePicker
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setToday(false); setPage(1); }}
              className="w-[150px] h-9"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found."
        keyExtractor={(o) => o.id}
        onRowClick={(o) => router.push(`/client/orders/${o.id}`)}
        mobileCard={(o) => (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{o.orderNumber}</p>
                <p className="text-xs text-gray-700 mt-0.5">{o.customer?.name || '-'}</p>
                {o.customer?.mobile && <p className="text-xs text-gray-600">{o.customer.mobile}</p>}
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white flex-shrink-0">
                &#8377;{Number(o.total).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              <Badge variant={statusColor(o.status)} className="text-[10px]">{o.status}</Badge>
              <Badge variant={o.paymentStatus === 'paid' ? 'default' : o.paymentStatus === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                {o.paymentStatus}
              </Badge>
              <Badge variant={o.orderType === 'online' ? 'default' : 'outline'} className="text-[10px]">
                {o.orderType}
              </Badge>
              <span className="text-[10px] text-gray-600 ml-auto">
                {new Date(o.orderDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      <CreateOfflineOrderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
