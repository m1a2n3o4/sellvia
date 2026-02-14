'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Search } from 'lucide-react';
import { Customer } from '@/types';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);

      const res = await fetch(`/api/client/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      console.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c: Customer) => (
        <span className="font-medium">{c.name}</span>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
    },
    {
      key: 'address',
      header: 'Address',
      render: (c: Customer) => (
        <span className="text-gray-500 dark:text-neutral-400 truncate max-w-[200px] inline-block">
          {[c.address, c.city, c.state].filter(Boolean).join(', ') || '-'}
        </span>
      ),
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      render: (c: Customer) => <span>{c.totalOrders}</span>,
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (c: Customer) => <span>&#8377;{Number(c.totalSpent).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Customers</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Manage your customer directory
          </p>
        </div>
        <Button onClick={() => router.push('/client/customers/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found. Add your first customer!"
        keyExtractor={(c) => c.id}
        onRowClick={(c) => router.push(`/client/customers/${c.id}`)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
