'use client';

import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone: string;
  message?: string;
}

export function FloatingWhatsApp({ phone, message = "Hi, I'm browsing your store" }: FloatingWhatsAppProps) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" fill="white" />
    </a>
  );
}
