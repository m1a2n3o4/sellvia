'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analytics {
  totals: { all: number; today: number; week: number; month: number };
  byCountry: Array<{ country: string | null; _count: number }>;
  byDevice: Array<{ device: string | null; _count: number }>;
  byReferrer: Array<{ referrer: string | null; _count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
}

interface Enquiry {
  id: string;
  name: string;
  mobile: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/superadmin/analytics').then((r) => r.json()).catch(() => null),
      fetch('/api/superadmin/enquiries').then((r) => r.json()).catch(() => ({ enquiries: [] })),
    ]).then(([analyticsData, enquiriesData]) => {
      setAnalytics(analyticsData);
      setEnquiries((enquiriesData?.enquiries || []).slice(0, 5));
      setLoading(false);
    });
  }, []);

  const maxTrend = analytics?.dailyTrend
    ? Math.max(...analytics.dailyTrend.map((d) => d.count), 1)
    : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Visitor Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Today', value: analytics?.totals.today ?? '-' },
          { label: 'This Week', value: analytics?.totals.week ?? '-' },
          { label: 'This Month', value: analytics?.totals.month ?? '-' },
          { label: 'All Time', value: analytics?.totals.all ?? '-' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white shadow rounded-lg p-5 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block h-7 w-10 bg-gray-200 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">visitors</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Trend */}
        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Visitors — Last 30 Days</h2>
          {loading ? (
            <div className="h-32 bg-gray-100 rounded animate-pulse" />
          ) : analytics?.dailyTrend && analytics.dailyTrend.length > 0 ? (
            <div className="flex items-end gap-[2px] h-32">
              {analytics.dailyTrend.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                  title={`${d.date}: ${d.count} visitors`}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No visitor data yet</p>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Visitors by Device</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : analytics?.byDevice && analytics.byDevice.length > 0 ? (
            <div className="space-y-3">
              {analytics.byDevice.map((d, i) => {
                const total = analytics.byDevice.reduce((sum, x) => sum + x._count, 0);
                const pct = total > 0 ? Math.round((d._count / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{d.device || 'Unknown'}</span>
                      <span className="text-gray-500">{d._count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Countries */}
        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Countries</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : analytics?.byCountry && analytics.byCountry.length > 0 ? (
            <div className="space-y-2">
              {analytics.byCountry.slice(0, 10).map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{c.country || 'Unknown'}</span>
                  <span className="text-gray-500 font-medium">{c._count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Referrers</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : analytics?.byReferrer && analytics.byReferrer.length > 0 ? (
            <div className="space-y-2">
              {analytics.byReferrer.slice(0, 10).map((r, i) => {
                let label = 'Direct';
                try {
                  if (r.referrer) label = new URL(r.referrer).hostname;
                } catch {
                  label = r.referrer || 'Direct';
                }
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[200px]">{label}</span>
                    <span className="text-gray-500 font-medium">{r._count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white shadow rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Enquiries</h2>
          <Link href="/superadmin/enquiries" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No enquiries yet</p>
        ) : (
          <div className="space-y-2">
            {enquiries.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.mobile}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[e.status] || 'bg-gray-100 text-gray-600'}`}>
                    {e.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
