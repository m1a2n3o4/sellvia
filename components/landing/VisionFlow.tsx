'use client';

import {
  User,
  MessageCircle,
  Camera,
  Link2,
  Instagram,
  ShoppingCart,
  Bot,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react';

const channels = [
  { icon: MessageCircle, label: 'Says "Hi"' },
  { icon: Camera, label: 'Screenshot' },
  { icon: Link2, label: 'E-shop Link' },
  { icon: Instagram, label: 'Instagram' },
  { icon: ShoppingCart, label: 'E-commerce' },
];

export function VisionFlow() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Customer */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[2.5px] border-dashed border-blue-400 flex items-center justify-center bg-blue-50/80">
          <User className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600" strokeWidth={1.5} />
        </div>
        <span className="font-hand text-xl sm:text-2xl text-blue-600 mt-1.5 font-bold">Your Customer</span>
      </div>

      {/* Down connector */}
      <div className="flex justify-center mb-1">
        <div className="h-5 border-l-[2.5px] border-dashed border-blue-300" />
      </div>

      <p className="text-center font-hand text-base sm:text-lg text-gray-400 mb-2">reaches you through...</p>

      {/* 5 Channels */}
      <div className="flex justify-between px-1 mb-1">
        {channels.map((ch, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 border-dashed border-blue-300 flex items-center justify-center bg-white shadow-sm">
              <ch.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" strokeWidth={1.5} />
            </div>
            <span className="font-hand text-xs sm:text-sm text-blue-700 font-bold text-center leading-tight w-14 sm:w-16">
              {ch.label}
            </span>
            <div className="h-4 border-l-2 border-dashed border-blue-300" />
          </div>
        ))}
      </div>

      {/* Down arrow */}
      <div className="flex justify-center mb-2">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#2563EB">
          <polygon points="8,12 0,3 16,3" />
        </svg>
      </div>

      {/* Smart WhatsApp Box */}
      <div className="border-[2.5px] border-dashed border-green-500 rounded-2xl p-3 sm:p-4 bg-green-50/50 text-center mb-2 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" strokeWidth={1.5} />
          <span className="font-hand text-xl sm:text-2xl text-green-700 font-bold">Your Smart WhatsApp</span>
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* Down connector + arrow */}
      <div className="flex justify-center mb-2">
        <div className="flex flex-col items-center">
          <div className="h-5 border-l-[2.5px] border-dashed border-blue-400" />
          <svg width="16" height="12" viewBox="0 0 16 12" fill="#2563EB">
            <polygon points="8,12 0,3 16,3" />
          </svg>
        </div>
      </div>

      {/* Dashboard Box */}
      <div className="border-[2.5px] border-dashed border-blue-500 rounded-2xl p-3 sm:p-4 bg-blue-50/50 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" strokeWidth={1.5} />
          <span className="font-hand text-xl sm:text-2xl text-blue-700 font-bold">Your Dashboard</span>
        </div>
        <span className="font-hand text-sm sm:text-base text-gray-500">(SatyaSell)</span>
        <p className="font-hand text-base sm:text-lg text-blue-600 mt-1 font-semibold">All Orders Placed</p>
      </div>

      {/* Confirmation loop back */}
      <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-xl bg-green-50/80 border-2 border-dashed border-green-300">
        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" strokeWidth={1.5} />
        <span className="font-hand text-base sm:text-lg text-green-700 font-semibold">
          Confirmation sent to Customer
        </span>
      </div>
    </div>
  );
}
