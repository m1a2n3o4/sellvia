'use client';

import { useEffect, useState } from 'react';
import { Transcript } from '@/components/superadmin/transcript';

interface Enquiry {
  id: string;
  name: string;
  mobile: string;
  instagramLink: string | null;
  website: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

const isWhatsApp = (e: Enquiry) => !!e.message?.startsWith('[WhatsApp]');
const cleanMessage = (m: string | null) => (m || '').replace(/^\[WhatsApp\]\s*/, '');

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/superadmin/enquiries');
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch {
      setError('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/superadmin/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus as Enquiry['status'] } : e))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading enquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Demo Enquiries ({enquiries.length})
      </h1>

      {enquiries.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          No enquiries yet. They will appear here when someone submits the demo form.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instagram</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isWhatsApp(e) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {isWhatsApp(e) ? 'WhatsApp' : 'Website'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <a href={`tel:${e.mobile}`} className="text-blue-600 hover:underline">{e.mobile}</a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {e.instagramLink ? (
                        <a href={e.instagramLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px] inline-block">
                          {e.instagramLink.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@')}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[260px]">
                      <button onClick={() => setSelected(e)} className="text-left hover:text-blue-700 w-full">
                        <span className="block truncate">{cleanMessage(e.message) || '-'}</span>
                        <span className="text-xs text-blue-600">View full details{isWhatsApp(e) ? ' & AI chat' : ''}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[e.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-500">
                  <a href={`tel:${selected.mobile}`} className="text-blue-600 hover:underline">{selected.mobile}</a>
                  {' · '}{isWhatsApp(selected) ? 'via WhatsApp' : 'via Website form'}{' · '}{new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Message</p>
                <p className="whitespace-pre-wrap text-gray-900">{cleanMessage(selected.message) || '-'}</p>
              </div>
              {selected.instagramLink && (
                <p><span className="text-xs font-medium text-gray-500 uppercase">Instagram </span>
                  <a href={selected.instagramLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selected.instagramLink}</a></p>
              )}
              {selected.website && <p><span className="text-xs font-medium text-gray-500 uppercase">Website </span>{selected.website}</p>}
              <a href={`https://wa.me/91${selected.mobile.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="inline-block text-sm text-green-700 hover:underline">
                Message on WhatsApp
              </a>
            </div>
            {isWhatsApp(selected) && (
              <div className="mt-5">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Full WhatsApp conversation with AI</p>
                <Transcript phone={selected.mobile} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
