'use client';

import { useEffect, useState } from 'react';

interface Msg {
  id: string;
  role: 'user' | 'assistant' | 'optout' | 'optin' | 'store';
  content: string;
  createdAt: string;
}

/** Full WhatsApp conversation with SatyaSell's number for one phone. */
export function Transcript({ phone }: { phone: string }) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMsgs(null);
    setError('');
    fetch(`/api/superadmin/platform-chats?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((d) => (d.messages ? setMsgs(d.messages) : setError(d.error || 'Failed to load')))
      .catch(() => setError('Failed to load'));
  }, [phone]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!msgs) return <p className="text-sm text-gray-500">Loading conversation...</p>;
  if (msgs.length === 0) return <p className="text-sm text-gray-500">No WhatsApp messages found for this number.</p>;

  return (
    <div className="space-y-2 bg-[#efeae2] rounded-lg p-3 max-h-[55vh] overflow-y-auto">
      {msgs.map((m) => {
        if (m.role === 'store' || m.role === 'optout' || m.role === 'optin') {
          const label =
            m.role === 'store'
              ? m.content
                ? 'Opened a demo store'
                : 'Returned to SatyaSell assistant'
              : m.role === 'optout'
                ? 'User unsubscribed (STOP)'
                : 'User resumed (START)';
          return (
            <p key={m.id} className="text-center text-xs text-gray-500">
              {label} &middot; {new Date(m.createdAt).toLocaleString()}
            </p>
          );
        }
        const isUser = m.role === 'user';
        return (
          <div key={m.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                isUser ? 'bg-white text-gray-900' : 'bg-[#d9fdd3] text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              <p className="mt-1 text-[10px] text-gray-500 text-right">
                {isUser ? 'Customer' : 'AI'} &middot; {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
