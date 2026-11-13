import Link from 'next/link';
import { DemoForm } from '@/components/landing/DemoForm';
import { FloatingWhatsApp } from '@/components/landing/FloatingWhatsApp';
import { PageTracker } from '@/components/landing/PageTracker';
import { OrbitalHero } from '@/components/landing/OrbitalHero';
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
import { SITE } from '@/lib/site';
import { ScrollReveal, StaggerReveal } from '@/components/landing/ScrollReveal';

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
    color: 'bg-violet-500/20 text-violet-400',
  },
  {
    icon: Bot,
    title: '24/7 WhatsApp AI',
    desc: 'Never miss a customer. AI answers questions, takes orders, even while you sleep.',
    color: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    icon: CreditCard,
    title: 'Auto Payment Links',
    desc: 'Secure payment links sent automatically inside WhatsApp. No manual effort needed.',
    color: 'bg-amber-500/20 text-amber-400',
  },
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    desc: 'All orders, payments, and analytics in one place. Online + offline orders together.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    desc: 'Every customer detail saved automatically. Order history, addresses, preferences.',
    color: 'bg-pink-500/20 text-pink-400',
  },
  {
    icon: Megaphone,
    title: 'Bulk Broadcasts',
    desc: 'Send offers, deals, and updates to all your customers at once via WhatsApp.',
    color: 'bg-orange-500/20 text-orange-400',
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
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased">
      <PageTracker />
      <FloatingWhatsApp />

      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SatyaSell</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors hidden md:block">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors hidden md:block">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors hidden md:block">
              Pricing
            </a>
            <a href="#demo" className="text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors hidden md:block">
              Contact
            </a>
            <a
              href={SITE.whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat on WhatsApp
            </a>
            <Link
              href="/client/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-sm shadow-violet-500/20"
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-gray-950 to-emerald-950/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 text-violet-400 text-sm font-medium mb-6 border border-violet-500/20">
                <Zap className="w-3.5 h-3.5" />
                WhatsApp Commerce for Indian Sellers
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight">
                Turn WhatsApp into your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  automated store
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Your customers message on WhatsApp. AI handles products, address, payment, and order —
                <strong className="text-white"> you just ship.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-500/30"
                >
                  Book a Free Demo
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={SITE.whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl border-2 border-gray-700 text-gray-300 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                >
                  See How It Works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  No credit card needed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Free to start
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Pay only when you earn
                </span>
              </div>
            </div>

            {/* Right: Orbital Ecosystem Animation */}
            <div className="flex justify-center lg:justify-end">
              <OrbitalHero />
            </div>
          </div>
        </div>

        {/* ── "NO NEED" Banner (from sketch) ── */}
        <ScrollReveal delay={300}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {/* NO NEED badges */}
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  To use all above — No need of
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {['Subscription', 'Trial / Demo', 'Credit Card'].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-16 bg-gray-700" />

              {/* Pricing highlight */}
              <div className="text-center sm:text-left flex-1">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-emerald-400">Free till your first 51 orders</span>
                  {' '}&mdash; feel the magic first!
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Then just <span className="font-bold text-violet-400">0.9% per order</span> when you get paid via SatyaSell.
                </p>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  You just need a mobile number. That&apos;s it.
                </p>
              </div>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-gray-800/60 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <StaggerReveal direction="up" staggerDelay={120} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-violet-400">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Still managing orders <span className="text-red-400">manually?</span>
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Most Indian sellers waste hours every day on these problems
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal direction="up" staggerDelay={100} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {painPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-red-500/10 border border-red-500/15">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-300 font-medium text-sm">{point.text}</p>
              </div>
            ))}
          </StaggerReveal>

          <ScrollReveal delay={300}>
            <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">
                SatyaSell automates everything.{' '}
                <span className="text-emerald-300">Save 99% of your time.</span>
              </p>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-lg bg-white text-violet-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 text-sm font-medium mb-4 border border-violet-500/20">
                Simple 4-Step Flow
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                How it works
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
                From customer message to order on your dashboard — fully automated
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal direction="up" staggerDelay={150} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                    {i + 1}
                  </div>
                  <step.icon className="w-6 h-6 text-violet-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-violet-500/40" />
                  </div>
                )}
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-medium mb-4 border border-emerald-500/20">
                Everything You Need
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Powerful features, zero complexity
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
                Built for Indian sellers who want to sell more and work less
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal direction="up" staggerDelay={100} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== MULTI-STORE ===== */}
      <section className="py-20 sm:py-24 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 text-sm font-medium mb-4 border border-violet-500/20">
                  Multi-Store Support
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  One account, multiple stores
                </h2>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Manage all your stores from a single dashboard. Each store gets its own e-commerce website, branding, products, and analytics.
                </p>
                <div className="mt-6 space-y-3">
                  {['Separate branding & themes per store', 'Individual store analytics & reports', 'Dedicated e-commerce website for each store', 'Switch between stores instantly'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={200}>
              <div className="grid grid-cols-2 gap-4">
                {['Store A', 'Store B', 'Store C', 'Master View'].map((name, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${i === 3 ? 'border-violet-500/30 bg-violet-500/10 col-span-2' : 'border-gray-700/50 bg-gray-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 3 ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{name}</p>
                        <p className="text-xs text-gray-500">{i === 3 ? 'All stores combined' : 'satyasell.com/store/...'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-medium mb-4 border border-emerald-500/20">
                Transparent Pricing
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                The simplest pricing ever
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                No plans. No subscriptions. No surprises.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
          <div className="relative rounded-3xl border-2 border-violet-500/30 bg-gradient-to-b from-violet-950/50 to-gray-900 p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              MOST POPULAR
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-violet-400 uppercase tracking-wide mb-2">Pay Per Order</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl sm:text-7xl font-extrabold text-white">1%</span>
                <span className="text-xl text-gray-500 font-medium">per order</span>
              </div>
              <p className="mt-3 text-gray-400">Only charged when a customer actually pays</p>
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
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/25"
              >
                Start Free Today
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="py-20 sm:py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Your data, your control
              </h2>
              <p className="mt-4 text-lg text-gray-400">Enterprise-grade security for every seller</p>
            </div>
          </ScrollReveal>
          <StaggerReveal direction="up" staggerDelay={150} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Bank-grade Security', desc: 'Your data stored in world-class secure Supabase databases with encryption at rest.' },
              { icon: MapPin, title: 'Secure Cloud Infrastructure', desc: 'Hosted on trusted cloud platforms with encrypted connections and strict access controls. Read our Privacy Policy for details.' },
              { icon: CreditCard, title: 'Secure Payments', desc: "India's most trusted payment gateway. Payments directly to your bank account." },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center">
                <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== DEMO FORM ===== */}
      <section id="demo" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal direction="left">
              <div className="lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 text-sm font-medium mb-4 border border-violet-500/20">
                  Get Started
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Ready to automate your WhatsApp sales?
                </h2>
                <p className="mt-4 text-lg text-gray-400 leading-relaxed">
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
                      <span className="text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <div className="bg-gray-900 rounded-2xl border border-gray-700/50 shadow-sm p-6 sm:p-8">
                <DemoForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800/60 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SatyaSell</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Smart WhatsApp ordering for Instagram sellers and small businesses in India.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2.5 text-sm text-gray-400">
                <a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                  {SITE.phoneDisplay}
                </a>
                <a href={SITE.whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  Chat on WhatsApp
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                  {SITE.email}
                </a>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {SITE.address.line1}, {SITE.address.line2},<br />
                    {SITE.address.region}, {SITE.address.country}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
              <div className="space-y-2.5 text-sm text-gray-400 flex flex-col">
                <Link href="/about" className="hover:text-violet-400 transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-violet-400 transition-colors">Contact Us</Link>
                <a href="#features" className="hover:text-violet-400 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</a>
                <Link href="/client/login" className="hover:text-violet-400 transition-colors">Seller Login</Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
              <div className="space-y-2.5 text-sm text-gray-400 flex flex-col">
                <Link href="/privacy-policy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link>
                <Link href="/refund-policy" className="hover:text-violet-400 transition-colors">Refund &amp; Cancellation</Link>
                <Link href="/data-deletion" className="hover:text-violet-400 transition-colors">Data Deletion</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              <p>&copy; 2026 SatyaSell. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1">{SITE.registrationLine}</p>
            </div>
            <p className="text-xs text-gray-600">
              Uses the WhatsApp Business Platform. WhatsApp is a trademark of Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
