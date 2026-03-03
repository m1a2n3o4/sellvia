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
      <div className={`${mobile ? 'h-1.5' : 'h-1'} bg-gradient-to-r ${pillar.gradient}`} />
      <div className={mobile ? 'p-4' : 'p-3.5'}>
        {/* Header */}
        <div className={`flex items-center ${mobile ? 'gap-3 mb-3' : 'gap-2.5 mb-2.5'}`}>
          <div
            className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-gradient-to-br ${pillar.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <Icon className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
          </div>
          <div className="min-w-0">
            <span className={`${mobile ? 'text-[10px]' : 'text-[9px]'} text-gray-400 font-semibold uppercase tracking-wider`}>
              0{num}
            </span>
            <h4 className={`${mobile ? 'text-base' : 'text-[13px]'} font-extrabold text-gray-900 leading-tight truncate`}>
              {pillar.title}
            </h4>
          </div>
        </div>
        {/* Feature list with cycling highlight */}
        <div className={mobile ? 'space-y-1' : 'space-y-0.5'}>
          {pillar.features.map((f, i) => {
            const FIcon = f.icon;
            const isActive = activeFeature === i;
            return (
              <div
                key={i}
                className={`flex items-center ${mobile ? 'gap-2.5 px-3 py-[7px]' : 'gap-1.5 px-2 py-[5px]'} rounded-md transition-all duration-500 ${
                  isActive
                    ? `${pillar.activeBg} ${pillar.activeText} scale-[1.02]`
                    : mobile ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <FIcon className={`${mobile ? 'w-4 h-4' : 'w-3 h-3'} flex-shrink-0`} />
                <span
                  className={`${mobile ? 'text-[13px]' : 'text-[10px]'} leading-tight ${isActive ? 'font-bold' : mobile ? 'font-semibold' : 'font-medium'} ${isActive ? '' : mobile ? 'text-gray-700' : ''}`}
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
  const [mobileCard, setMobileCard] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Feature cycling timer (all screen sizes)
    const featureTimer = setInterval(() => {
      setActiveIdx((prev) =>
        prev.map((v, i) => (v + 1) % pillars[i].features.length)
      );
    }, 2200);
    // Mobile card carousel timer
    const cardTimer = setInterval(() => {
      setMobileCard((prev) => (prev + 1) % 3);
    }, 4500);
    return () => {
      clearInterval(featureTimer);
      clearInterval(cardTimer);
    };
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

      {/* ══════ MOBILE LAYOUT (Animated Carousel) ══════ */}
      <div className="lg:hidden flex flex-col items-center w-full">
        {/* ── Center Hub with Mini Orbital Ring ── */}
        <div className="flex flex-col items-center mb-2">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-2">
            Your Business
          </span>

          <div className="relative">
            {/* Mini rotating orbital ring */}
            <svg
              className="absolute -inset-[22px]"
              viewBox="0 0 132 132"
              style={{ animation: 'ss-orbit 28s linear infinite' }}
            >
              <defs>
                <linearGradient id="m-orb" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <circle
                cx="66"
                cy="66"
                r="58"
                fill="none"
                stroke="url(#m-orb)"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              {/* 3 orbiting dots */}
              <circle r="3" fill="#8B5CF6" opacity="0.8">
                <animateMotion
                  dur="28s"
                  repeatCount="indefinite"
                  path="M66,8 A58,58 0 0,1 66,124 A58,58 0 0,1 66,8"
                />
              </circle>
              <circle r="2.5" fill="#10B981" opacity="0.7">
                <animateMotion
                  dur="28s"
                  repeatCount="indefinite"
                  begin="-9.3s"
                  path="M66,8 A58,58 0 0,1 66,124 A58,58 0 0,1 66,8"
                />
              </circle>
              <circle r="2.5" fill="#3B82F6" opacity="0.7">
                <animateMotion
                  dur="28s"
                  repeatCount="indefinite"
                  begin="-18.6s"
                  path="M66,8 A58,58 0 0,1 66,124 A58,58 0 0,1 66,8"
                />
              </circle>
            </svg>

            {/* Glow pulse */}
            <div
              className="absolute -inset-3 rounded-full bg-violet-400/15 blur-lg"
              style={{ animation: 'ss-pulse-ring 3s ease-in-out infinite' }}
            />

            {/* Main SatyaSell circle */}
            <div
              className="relative w-[88px] h-[88px] rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center shadow-xl"
              style={{ animation: 'ss-pulse-glow 3s ease-in-out infinite' }}
            >
              <Zap className="w-6 h-6 text-white mb-0.5" />
              <span className="text-white font-extrabold text-xs tracking-wide">
                SatyaSell
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-4">
            Get All 3 Free
          </span>
        </div>

        {/* ── Animated Branch Lines ── */}
        <svg className="w-[260px] h-[30px] my-1" viewBox="0 0 260 30">
          {[
            { x2: 43, idx: 0 },
            { x2: 130, idx: 1 },
            { x2: 217, idx: 2 },
          ].map((line) => (
            <line
              key={line.idx}
              x1="130"
              y1="0"
              x2={line.x2}
              y2="26"
              stroke={mobileCard === line.idx ? pillars[line.idx].dotColor : '#E5E7EB'}
              strokeWidth={mobileCard === line.idx ? '1.5' : '1'}
              strokeDasharray="4 3"
              className="transition-all duration-500"
              style={
                mobileCard === line.idx
                  ? { animation: 'ss-dash-flow 2s linear infinite' }
                  : undefined
              }
            />
          ))}
        </svg>

        {/* ── 3 Pillar Tabs (tappable) ── */}
        <div className="flex items-end justify-center gap-8 mb-5">
          {pillars.map((pillar, i) => {
            const TabIcon = pillar.icon;
            const isActive = mobileCard === i;
            return (
              <button
                key={i}
                onClick={() => setMobileCard(i)}
                className="flex flex-col items-center gap-1.5 relative"
              >
                <div
                  className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${pillar.gradient} flex items-center justify-center transition-all duration-400 ${
                    isActive ? 'scale-110' : 'opacity-35 scale-90'
                  }`}
                  style={
                    isActive
                      ? { boxShadow: `0 4px 16px ${pillar.dotColor}45` }
                      : undefined
                  }
                >
                  <TabIcon className="w-5 h-5 text-white" />
                  {/* Active ring indicator */}
                  {isActive && (
                    <div
                      className="absolute -inset-[3px] rounded-full border-2 opacity-40"
                      style={{ borderColor: pillar.dotColor }}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-extrabold tracking-wide transition-all duration-300 ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                  style={isActive ? { color: pillar.dotColor } : undefined}
                >
                  {['Dashboard', 'WhatsApp', 'E-Com'][i]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Card Carousel (one card at a time, fade + float) ── */}
        <div className="relative w-full px-3" style={{ minHeight: 220 }}>
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className={`w-full transition-all duration-500 ${
                mobileCard === i
                  ? 'opacity-100 translate-y-0 relative'
                  : 'opacity-0 translate-y-4 absolute inset-x-0 top-0 pointer-events-none'
              }`}
              style={
                mobileCard === i
                  ? { animation: 'ss-float-2 5s ease-in-out infinite' }
                  : undefined
              }
            >
              <PillarCard
                pillar={pillar}
                activeFeature={activeIdx[i]}
                num={i + 1}
                mobile
              />
            </div>
          ))}
        </div>

        {/* ── Carousel dots ── */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {pillars.map((pillar, i) => (
            <button
              key={i}
              onClick={() => setMobileCard(i)}
              className={`rounded-full transition-all duration-300 ${
                mobileCard === i ? 'w-6 h-2' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              style={
                mobileCard === i
                  ? { backgroundColor: pillar.dotColor }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
