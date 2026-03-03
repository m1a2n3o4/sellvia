'use client';

import { useEffect, useState } from 'react';
import {
  MessageCircle,
  Bot,
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowDown,
  Smartphone,
  LayoutDashboard,
} from 'lucide-react';

const flowSteps = [
  {
    icon: MessageCircle,
    label: 'Customer Messages',
    sublabel: '"I want to buy a kurti"',
    color: 'from-emerald-400 to-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  {
    icon: Bot,
    label: 'AI Replies Instantly',
    sublabel: 'Shows products + prices',
    color: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-200',
    textColor: 'text-violet-700',
    dotColor: 'bg-violet-500',
  },
  {
    icon: ShoppingBag,
    label: 'Customer Orders',
    sublabel: 'Picks product, gives address',
    color: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    icon: CreditCard,
    label: 'Auto Payment Link',
    sublabel: 'Secure payment via UPI/Card',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  {
    icon: CheckCircle,
    label: 'Order on Dashboard!',
    sublabel: 'You just ship it',
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-600',
  },
];

export function HeroFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flowSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Phone frame */}
      <div className="relative mx-auto w-[280px] sm:w-[320px]">
        {/* Phone shell */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-300">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden">
            {/* WhatsApp header */}
            <div className="bg-emerald-600 px-4 py-3 pt-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Your Store AI</p>
                <p className="text-emerald-100 text-[10px]">online</p>
              </div>
            </div>

            {/* Chat area */}
            <div className="p-3 space-y-2.5 min-h-[320px] sm:min-h-[360px] bg-[#ECE5DD] relative overflow-hidden">
              {/* Customer message */}
              <div className={`flex justify-end transition-all duration-500 ${activeStep >= 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
                  <p className="text-[11px] text-gray-800">Hi, I want to buy a red kurti</p>
                  <p className="text-[9px] text-gray-500 text-right mt-0.5">10:30 AM</p>
                </div>
              </div>

              {/* AI reply - products */}
              <div className={`flex justify-start transition-all duration-500 delay-300 ${activeStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                  <p className="text-[11px] text-gray-800">Here are our best kurtis! 👗</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    <div className="bg-gray-50 rounded p-1.5">
                      <div className="w-full h-12 bg-gradient-to-br from-red-200 to-pink-200 rounded mb-1" />
                      <p className="text-[9px] font-semibold text-gray-700">Red Cotton Kurti</p>
                      <p className="text-[9px] text-emerald-600 font-bold">₹599</p>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5">
                      <div className="w-full h-12 bg-gradient-to-br from-rose-200 to-red-200 rounded mb-1" />
                      <p className="text-[9px] font-semibold text-gray-700">Maroon Silk Kurti</p>
                      <p className="text-[9px] text-emerald-600 font-bold">₹799</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">10:30 AM</p>
                </div>
              </div>

              {/* Customer picks */}
              <div className={`flex justify-end transition-all duration-500 delay-300 ${activeStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
                  <p className="text-[11px] text-gray-800">I want the Red Cotton Kurti, size M</p>
                  <p className="text-[9px] text-gray-500 text-right mt-0.5">10:31 AM</p>
                </div>
              </div>

              {/* AI address collection */}
              <div className={`flex justify-start transition-all duration-500 delay-300 ${activeStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                  <p className="text-[11px] text-gray-800">Great choice! 🎉 Please share your delivery address</p>
                  <p className="text-[9px] text-gray-500 mt-1">10:31 AM</p>
                </div>
              </div>

              {/* Payment link */}
              <div className={`flex justify-start transition-all duration-500 delay-300 ${activeStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                  <p className="text-[11px] text-gray-800">Your order is ready! 🛒</p>
                  <div className="mt-1.5 bg-blue-50 border border-blue-100 rounded-lg p-2">
                    <p className="text-[10px] font-semibold text-blue-700">💳 Pay ₹599</p>
                    <p className="text-[9px] text-blue-500 underline">Click to pay securely</p>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">10:32 AM</p>
                </div>
              </div>

              {/* Order confirmed */}
              <div className={`flex justify-start transition-all duration-500 delay-300 ${activeStep >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-[11px] font-semibold text-emerald-700">Order Confirmed! #SS-1024</p>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">We&apos;ll deliver in 2-3 days</p>
                  <p className="text-[9px] text-gray-500 mt-1">10:33 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step indicator - right side */}
        <div className="absolute -right-4 sm:-right-6 top-16 space-y-3">
          {flowSteps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 transition-all duration-500 ${
                activeStep === i ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-1'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${step.dotColor} ${activeStep === i ? 'scale-150' : 'scale-100'} transition-transform`} />
            </div>
          ))}
        </div>
      </div>

      {/* Active step label below phone */}
      <div className="mt-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${flowSteps[activeStep].bg} ${flowSteps[activeStep].ring} ring-1 transition-all duration-300`}>
          {(() => {
            const Icon = flowSteps[activeStep].icon;
            return <Icon className={`w-4 h-4 ${flowSteps[activeStep].textColor}`} />;
          })()}
          <span className={`text-sm font-semibold ${flowSteps[activeStep].textColor}`}>
            {flowSteps[activeStep].label}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{flowSteps[activeStep].sublabel}</p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {flowSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`rounded-full transition-all duration-300 ${
                activeStep === i ? 'w-6 h-2 bg-violet-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
