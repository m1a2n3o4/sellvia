'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  Globe,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Bot,
  Search,
  CreditCard,
  Truck,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Zap,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

/* ── 3 Pillar Data (from sketch) ── */
type Feature = { icon: LucideIcon; label: string };
type Pillar = {
  icon: LucideIcon;
  title: string;
  gradient: string;
  bg: string;
  border: string;
  activeBg: string;
  activeText: string;
  dotColor: string;
  features: Feature[];
};

const pillars: Pillar[] = [
  {
    icon: LayoutDashboard,
    title: 'Master Dashboard',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200/70',
    activeBg: 'bg-blue-100',
    activeText: 'text-blue-700',
    dotColor: '#3B82F6',
    features: [
      { icon: Package, label: 'Product Manager' },
      { icon: ShoppingCart, label: 'Order Management' },
      { icon: FileText, label: 'Bills & Invoices' },
      { icon: Bot, label: 'AI Auto Orders' },
      { icon: Megaphone, label: 'Promotions' },
      { icon: Users, label: 'All Customers' },
    ],
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp AI',
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/70',
    activeBg: 'bg-emerald-100',
    activeText: 'text-emerald-700',
    dotColor: '#10B981',
    features: [
      { icon: Bot, label: 'Auto Enquiry Reply' },
      { icon: Search, label: 'Product Search' },
      { icon: CreditCard, label: 'Auto Payment Link' },
      { icon: Truck, label: 'Delivery Updates' },
      { icon: MapPin, label: 'Order Tracking' },
      { icon: AlertCircle, label: 'Complaint Handling' },
    ],
  },
  {
    icon: Globe,
    title: 'E-Com Website',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200/70',
    activeBg: 'bg-violet-100',
    activeText: 'text-violet-700',
    dotColor: '#8B5CF6',
    features: [
      { icon: ShoppingBag, label: 'Full Catalog' },
      { icon: ShoppingCart, label: 'Cart & Checkout' },
      { icon: CreditCard, label: 'Online / COD Pay' },
      { icon: MapPin, label: 'Order Tracking' },
      { icon: MessageCircle, label: 'Pay via WhatsApp' },
    ],
  },
];

/* ── Pillar Card ── */
function PillarCard({
  pillar,
  activeFeature,
  num,
  mobile,
}: {
  pillar: Pillar;
  activeFeature: number;
  num: number;
  mobile?: boolean;
}) {
  const Icon = pillar.icon;
  return (
    <div
      className={`${mobile ? 'w-full' : 'w-[192px]'} bg-white/90 backdrop-blur-sm rounded-xl border ${pillar.border} shadow-lg shadow-gray-200/60 overflow-hidden`}
    >
      {/* Top gradient strip */}
      <div className={`h-1 bg-gradient-to-r ${pillar.gradient}`} />
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pillar.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
              0{num}
            </span>
            <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate">
              {pillar.title}
            </h4>
          </div>
        </div>
        {/* Feature list with cycling highlight */}
        <div className="space-y-0.5">
          {pillar.features.map((f, i) => {
            const FIcon = f.icon;
            const isActive = activeFeature === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2 py-[5px] rounded-md transition-all duration-500 ${
                  isActive
                    ? `${pillar.activeBg} ${pillar.activeText} scale-[1.02]`
                    : 'text-gray-400'
                }`}
              >
                <FIcon className="w-3 h-3 flex-shrink-0" />
                <span
                  className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}
                >
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main OrbitalHero Component ── */
export function OrbitalHero() {
  const [activeIdx, setActiveIdx] = useState([0, 0, 0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setActiveIdx((prev) =>
        prev.map((v, i) => (v + 1) % pillars[i].features.length)
      );
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* ══════ DESKTOP ORBITAL LAYOUT ══════ */}
      <div className="hidden lg:block relative" style={{ width: 560, height: 500 }}>
        {/* ── Rotating Orbital Ring ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 560 500"
          style={{ animation: 'ss-orbit 50s linear infinite' }}
        >
          <defs>
            <linearGradient id="orb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="33%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="66%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <ellipse
            cx="280"
            cy="250"
            rx="215"
            ry="175"
            fill="none"
            stroke="url(#orb-grad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />
          {/* Orbiting dots on the ring */}
          <circle r="3" fill="#8B5CF6" opacity="0.6">
            <animateMotion
              dur="50s"
              repeatCount="indefinite"
              path="M280,75 A215,175 0 0,1 280,425 A215,175 0 0,1 280,75"
            />
          </circle>
          <circle r="2.5" fill="#10B981" opacity="0.5">
            <animateMotion
              dur="50s"
              repeatCount="indefinite"
              begin="-16.6s"
              path="M280,75 A215,175 0 0,1 280,425 A215,175 0 0,1 280,75"
            />
          </circle>
          <circle r="2.5" fill="#3B82F6" opacity="0.5">
            <animateMotion
              dur="50s"
              repeatCount="indefinite"
              begin="-33.3s"
              path="M280,75 A215,175 0 0,1 280,425 A215,175 0 0,1 280,75"
            />
          </circle>
        </svg>

        {/* ── Connection Lines (static, animated dashes) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 560 500"
        >
          <defs>
            <linearGradient
              id="ln-1"
              x1="280"
              y1="230"
              x2="140"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient
              id="ln-2"
              x1="280"
              y1="230"
              x2="420"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient
              id="ln-3"
              x1="280"
              y1="275"
              x2="280"
              y2="400"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Center → Card 1 (top-left) */}
          <line
            x1="260"
            y1="225"
            x2="150"
            y2="90"
            stroke="url(#ln-1)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            style={{ animation: 'ss-dash-flow 3s linear infinite' }}
          />
          {/* Center → Card 2 (top-right) */}
          <line
            x1="300"
            y1="225"
            x2="410"
            y2="90"
            stroke="url(#ln-2)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            style={{ animation: 'ss-dash-flow 3s linear infinite reverse' }}
          />
          {/* Center → Card 3 (bottom) */}
          <line
            x1="280"
            y1="280"
            x2="280"
            y2="395"
            stroke="url(#ln-3)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            style={{ animation: 'ss-dash-flow 3s linear infinite' }}
          />
        </svg>

        {/* ── Center Hub: SatyaSell ── */}
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-10">
          {/* "Your Business" label */}
          <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
              Your Business
            </span>
            <svg width="2" height="18" className="mt-1">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="18"
                stroke="#A78BFA"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            </svg>
          </div>

          {/* Glow rings */}
          <div
            className="absolute -inset-6 rounded-full bg-violet-400/15 blur-xl"
            style={{ animation: 'ss-pulse-ring 3s ease-in-out infinite' }}
          />
          <div
            className="absolute -inset-3 rounded-full bg-violet-400/20 blur-md"
            style={{ animation: 'ss-pulse-ring 3s ease-in-out infinite 1s' }}
          />

          {/* Main circle */}
          <div
            className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center shadow-2xl"
            style={{ animation: 'ss-pulse-glow 3s ease-in-out infinite' }}
          >
            <Zap className="w-7 h-7 text-white mb-0.5" />
            <span className="text-white font-extrabold text-[11px] tracking-wide">
              SatyaSell
            </span>
          </div>

          {/* "Get All Free" badge */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              Get All 3 Free
            </span>
          </div>
        </div>

        {/* ── Card 1: Master Dashboard (top-left) ── */}
        <div
          className="absolute top-0 left-0"
          style={{ animation: 'ss-float-1 6s ease-in-out infinite' }}
        >
          <PillarCard pillar={pillars[0]} activeFeature={activeIdx[0]} num={1} />
        </div>

        {/* ── Card 2: WhatsApp AI (top-right) ── */}
        <div
          className="absolute top-0 right-0"
          style={{ animation: 'ss-float-2 5s ease-in-out infinite 0.8s' }}
        >
          <PillarCard pillar={pillars[1]} activeFeature={activeIdx[1]} num={2} />
        </div>

        {/* ── Card 3: E-Com Website (bottom-center) ── */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ animation: 'ss-float-3 7s ease-in-out infinite 1.6s' }}
        >
          <PillarCard pillar={pillars[2]} activeFeature={activeIdx[2]} num={3} />
        </div>
      </div>

      {/* ══════ MOBILE LAYOUT ══════ */}
      <div className="lg:hidden flex flex-col items-center">
        {/* Center hub */}
        <div className="flex flex-col items-center mb-5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1.5">
            Your Business
          </span>
          <svg width="2" height="16">
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="16"
              stroke="#A78BFA"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          </svg>
          <div className="relative mt-2">
            <div className="absolute -inset-4 rounded-full bg-violet-400/10 blur-lg" />
            <div
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center shadow-xl shadow-violet-300/40"
              style={{ animation: 'ss-pulse-glow 3s ease-in-out infinite' }}
            >
              <Zap className="w-5 h-5 text-white mb-0.5" />
              <span className="text-white font-extrabold text-[10px] tracking-wide">
                SatyaSell
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-3">
            Get All 3 Free
          </span>
        </div>

        {/* Connection arrow */}
        <div className="flex justify-center mb-3">
          <svg width="2" height="20">
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="20"
              stroke="#A78BFA"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          </svg>
        </div>

        {/* Cards stacked */}
        <div className="space-y-3 w-full max-w-[300px]">
          {pillars.map((pillar, i) => (
            <PillarCard
              key={i}
              pillar={pillar}
              activeFeature={activeIdx[i]}
              num={i + 1}
              mobile
            />
          ))}
        </div>
      </div>
    </div>
  );
}
