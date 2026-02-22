'use client';

import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const phoneNumber = '919553345235';
  const preText = encodeURIComponent('Hey, i want to talk to you!');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${preText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white pl-5 pr-6 py-3 rounded-full shadow-lg shadow-green-200 transition-all hover:scale-105"
    >
      <MessageCircle className="w-7 h-7 animate-bounce" strokeWidth={2} />
      <span className="font-hand text-lg font-bold">Ask anything directly</span>
    </a>
  );
}
