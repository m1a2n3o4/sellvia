'use client';

import { useEffect, useState } from 'react';
import { Transcript } from '@/components/superadmin/transcript';

interface Conversation {
  phone: string;
  name: string | null;
  messageCount: number;
  lastAt: string;
  lastRole: string | null;
  lastMessage: string;
}

export default function PlatformChatsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/platform-chats')
      .then((r) => r.json())
      .then((d) => setItems(d.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">WhatsApp Chats ({items.length})</h1>
      <p className="text-sm text-gray-500 mb-6">
        Conversations people have with the SatyaSell AI assistant (including demo stores) on +91 77802 25235.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">No conversations yet.</div>
      ) : (
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-2 bg-white shadow rounded-lg divide-y divide-gray-100 max-h-[75vh] overflow-y-auto">
            {items.map((c) => (
              <button
                key={c.phone}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selected?.phone === c.phone ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-gray-900 text-sm">{c.name || `+${c.phone}`}</span>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(c.lastAt).toLocaleDateString()}</span>
                </div>
                {c.name && <p className="text-xs text-gray-500">+{c.phone}</p>}
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {c.lastRole === 'assistant' ? 'AI: ' : ''}
                  {c.lastMessage}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.messageCount} messages</p>
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white shadow rounded-lg p-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">{selected.name || `+${selected.phone}`}</h2>
                  <a href={`https://wa.me/${selected.phone}`} target="_blank" rel="noreferrer" className="text-sm text-green-700 hover:underline">
                    Open in WhatsApp
                  </a>
                </div>
                <Transcript phone={selected.phone} />
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a conversation to read the full history.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
