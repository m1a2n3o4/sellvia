import Link from 'next/link';
import { DemoForm } from '@/components/landing/DemoForm';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { PageTracker } from '@/components/landing/PageTracker';
import {
  MessageCircle,
  ShoppingBag,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  ImagePlus,
  Bot,
  LayoutDashboard,
  Users,
  Megaphone,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Clock,
  TrendingUp,
  Store,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { MobileNav } from '@/components/landing/MobileNav';

const steps = [
  {
    icon: MessageCircle,
    title: 'Customer messages you',
    desc: 'A customer sends a WhatsApp message to your business number.',
  },
  {
    icon: ShoppingBag,
    title: 'AI shows your products',
    desc: 'Smart assistant instantly replies with your catalog and prices.',
  },
  {
    icon: Package,
    title: 'Customer picks & orders',
    desc: 'They choose a product, share address — all inside WhatsApp.',
  },
  {
    icon: CreditCard,
    title: 'Payment & confirmation',
    desc: 'Secure payment link sent automatically. Order lands on your dashboard.',
  },
];

const features = [
  {
    icon: ImagePlus,
    title: 'AI Product Upload',
    desc: 'Upload product images — AI auto-fills name, price, and brand. Add 20 products in minutes.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Bot,
    title: '24/7 WhatsApp AI',
    desc: 'Never miss a customer. AI answers questions, takes orders, even while you sleep.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: CreditCard,
    title: 'Auto Payment Links',
    desc: 'Secure payment links sent automatically inside WhatsApp. No manual effort needed.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    desc: 'All orders, payments, and analytics in one place. Online + offline orders together.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    desc: 'Every customer detail saved automatically. Order history, addresses, preferences.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Megaphone,
    title: 'Bulk Broadcasts',
    desc: 'Send offers, deals, and updates to all your customers at once via WhatsApp.',
    color: 'bg-orange-100 text-orange-600',
  },
];

const stats = [
  { value: '500+', label: 'Sellers Onboarded' },
  { value: '10K+', label: 'Orders Processed' },
  { value: '24/7', label: 'AI Availability' },
  { value: '1%', label: 'Only Per Order Fee' },
];

const painPoints = [
  { text: 'Manually sending payment links to every customer', icon: Clock },
  { text: 'Losing customers because you replied too late', icon: TrendingUp },
  { text: 'Spending your entire day on WhatsApp for orders', icon: MessageCircle },
  { text: 'Forgetting orders and missing payments', icon: Package },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <PageTracker />
      <FloatingWhatsApp />

      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SatyaSell</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors hidden md:block">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors hidden md:block">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors hidden md:block">
              Pricing
            </a>
            <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors hidden md:block">
              Contact
            </a>
            <Link
              href="/client/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
            >
              Login
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-emerald-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              WhatsApp Commerce for Indian Sellers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Turn WhatsApp into your{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                automated store
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your customers message on WhatsApp. AI handles products, address, payment, and order —
              <strong className="text-gray-900"> you just ship.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-200"
              >
                Book a Free Demo
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-all"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              No credit card needed
              <span className="mx-2 text-gray-300">|</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Free to start
              <span className="mx-2 text-gray-300 hidden sm:inline">|</span>
              <span className="hidden sm:flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Pay only when you earn
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-violet-600">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Still managing orders <span className="text-red-500">manually?</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Most Indian sellers waste hours every day on these problems
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {painPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-red-50 border border-red-100">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium text-sm">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-center">
            <p className="text-xl sm:text-2xl font-bold text-white">
              SatyaSell automates everything.{' '}
              <span className="text-emerald-300">Save 99% of your time.</span>
            </p>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-lg bg-white text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
              Simple 4-Step Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              From customer message to order on your dashboard — fully automated
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                    {i + 1}
                  </div>
                  <step.icon className="w-6 h-6 text-violet-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-violet-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              Everything You Need
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Powerful features, zero complexity
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Built for Indian sellers who want to sell more and work less
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MULTI-STORE ===== */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
                Multi-Store Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                One account, multiple stores
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Manage all your stores from a single dashboard. Each store gets its own e-commerce website, branding, products, and analytics.
              </p>
              <div className="mt-6 space-y-3">
                {['Separate branding & themes per store', 'Individual store analytics & reports', 'Dedicated e-commerce website for each store', 'Switch between stores instantly'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Store A', 'Store B', 'Store C', 'Master View'].map((name, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${i === 3 ? 'border-violet-200 bg-violet-50 col-span-2' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 3 ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{name}</p>
                      <p className="text-xs text-gray-400">{i === 3 ? 'All stores combined' : 'satyasell.com/store/...'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              The simplest pricing ever
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No plans. No subscriptions. No surprises.
            </p>
          </div>

          <div className="relative rounded-3xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              MOST POPULAR
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-violet-600 uppercase tracking-wide mb-2">Pay Per Order</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl sm:text-7xl font-extrabold text-gray-900">1%</span>
                <span className="text-xl text-gray-400 font-medium">per order</span>
              </div>
              <p className="mt-3 text-gray-500">Only charged when a customer actually pays</p>
            </div>

            <div className="mt-10 space-y-4 max-w-sm mx-auto">
              {[
                'Everything included — no hidden fees',
                'No order = you pay ₹0. Nothing.',
                'No monthly or yearly plans',
                'No credit card needed to start',
                'Unlimited products, orders & customers',
                'WhatsApp AI assistant included',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
              >
                Start Free Today
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Your data, your control
            </h2>
            <p className="mt-4 text-lg text-gray-500">Enterprise-grade security for every seller</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Bank-grade Security', desc: 'Your data stored in world-class secure Supabase databases with encryption at rest.' },
              { icon: MapPin, title: 'India-hosted Servers', desc: 'All data stays in India. Compliant with local data protection standards.' },
              { icon: CreditCard, title: 'Secure Payments', desc: "India's most trusted payment gateway. Payments directly to your bank account." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEMO FORM ===== */}
      <section id="demo" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
                Get Started
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Ready to automate your WhatsApp sales?
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Book a free demo and we&apos;ll set up everything for you. No technical knowledge needed.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Free setup — we do everything for you',
                  'Live demo of your own store',
                  'Start selling in under 30 minutes',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <DemoForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SatyaSell</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="tel:9515456891" className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors">
                <Phone className="w-4 h-4" />
                9515456891
              </a>
              <a href="mailto:admin@satyasell.com" className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors">
                <Mail className="w-4 h-4" />
                admin@satyasell.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; 2026 SatyaSell. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/client/login" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">
                Seller Login
              </Link>
              <a href="#features" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">
                Pricing
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
