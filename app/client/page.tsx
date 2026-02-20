'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { DashboardMetrics, Order } from '@/types';

export default function ClientDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/client/dashboard/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch {
        console.error('Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const MetricCard = ({
    label,
    value,
    icon,
    bgColor,
    iconColor,
  }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-neutral-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? (
              <span className="inline-block h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': case 'paid': return 'default';
      case 'cancelled': case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-700 dark:text-neutral-400 mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Products"
          value={metrics?.totalProducts ?? 0}
          icon={<Package className="h-5 w-5" />}
          bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          iconColor="text-indigo-600"
        />
        <MetricCard
          label="Total Orders"
          value={metrics?.totalOrders ?? 0}
          icon={<ShoppingCart className="h-5 w-5" />}
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="Customers"
          value={metrics?.totalCustomers ?? 0}
          icon={<Users className="h-5 w-5" />}
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600"
        />
        <MetricCard
          label="Today&apos;s Revenue"
          value={`₹${(metrics?.todayRevenue ?? 0).toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          bgColor="bg-green-50 dark:bg-green-900/20"
          iconColor="text-green-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-700 dark:text-neutral-400">Today Orders</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? '-' : metrics?.todayOrders ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-700 dark:text-neutral-400">Active Products</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? '-' : metrics?.activeProducts ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-700 dark:text-neutral-400">Low Stock Items</p>
          <p className={`text-xl font-bold mt-1 ${(metrics?.lowStockCount ?? 0) > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
            {loading ? '-' : metrics?.lowStockCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-700 dark:text-neutral-400">Total Products</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? '-' : metrics?.totalProducts ?? 0}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Orders
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (metrics?.recentOrders?.length ?? 0) === 0 ? (
            <div className="text-sm text-gray-700 dark:text-neutral-400 text-center py-8">
              No orders yet. They&apos;ll appear here once customers start ordering.
            </div>
          ) : (
            <div className="space-y-2">
              {metrics?.recentOrders?.map((order: Order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`/client/orders/${order.id}`)}
                  className="w-full text-left flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-700">
                      {order.customer?.name} - {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">&#8377;{Number(order.total).toLocaleString()}</p>
                    <Badge variant={statusColor(order.status)} className="text-[10px]">
                      {order.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (metrics?.lowStockCount ?? 0) === 0 ? (
            <div className="text-sm text-gray-700 dark:text-neutral-400 text-center py-8">
              All products are well-stocked!
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-neutral-400 text-center py-8">
              <p className="text-red-600 font-medium text-lg">{metrics?.lowStockCount} product(s)</p>
              <p className="mt-1">have stock at or below threshold.</p>
              <button
                onClick={() => router.push('/client/products')}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                View Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
