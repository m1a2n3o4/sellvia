'use client';

import { MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';

export function FloatingWhatsApp() {
  const whatsappUrl = SITE.whatsappUrl('Hey, I want to know more about SatyaSell!');

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">Chat with us</span>
    </a>
  );
}
