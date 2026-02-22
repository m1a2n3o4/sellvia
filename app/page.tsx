import Link from 'next/link';
import { SketchBox } from '@/components/landing/SketchBox';
import { SketchUnderline } from '@/components/landing/SketchUnderline';
import { DemoForm } from '@/components/landing/DemoForm';
import { VisionFlow } from '@/components/landing/VisionFlow';
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
  Lock,
  Shield,
  Server,
  ChevronDown,
  Phone,
  Mail,
} from 'lucide-react';

const flowSteps = [
  {
    icon: MessageCircle,
    title: 'Customer messages on WhatsApp',
    desc: 'Your customer sends a message to your WhatsApp number',
  },
  {
    icon: ShoppingBag,
    title: 'Shows your products instantly',
    desc: 'Instantly replies with your product details and prices',
  },
  {
    icon: Package,
    title: 'Customer picks a product',
    desc: 'Customer says which product they want to order',
  },
  {
    icon: MapPin,
    title: 'Collects delivery address',
    desc: 'Asks for their delivery address automatically',
  },
  {
    icon: CreditCard,
    title: 'Payment link sent automatically',
    desc: 'Secure payment link is sent right inside WhatsApp',
  },
  {
    icon: CheckCircle,
    title: 'Order placed on your Dashboard!',
    desc: 'Payment done! Order appears on your dashboard instantly',
  },
];

const painPoints = [
  'Sending payment links manually to every customer?',
  'Sharing QR codes one by one?',
  'Losing customers because you replied too late?',
  'Spending your whole day on WhatsApp just for orders?',
  'Missing orders because you forgot to reply?',
];

const features = [
  {
    icon: ImagePlus,
    title: 'Smart Product Upload',
    desc: 'Just upload product images — auto fills name, price, brand automatically. Add 20 products in minutes!',
  },
  {
    icon: Bot,
    title: '24/7 WhatsApp Assistant',
    desc: 'Answers all your customer questions 24/7. No customer lost. Even when you are sleeping!',
  },
  {
    icon: CreditCard,
    title: 'Auto Payment Links',
    desc: "India's most secure payment gateway. Links sent automatically — no manual effort from you.",
  },
  {
    icon: LayoutDashboard,
    title: 'Order Dashboard',
    desc: 'See all your orders, payments, history in one place. Online + Offline orders together.',
  },
  {
    icon: Users,
    title: 'Customer Data',
    desc: 'All your customer details saved safely. Never lose a customer again. Complete order history.',
  },
  {
    icon: Megaphone,
    title: 'Bulk WhatsApp Messages',
    desc: 'Send promotions, offers, and ads to all your customers at once. Grow your business!',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageTracker />
      <FloatingWhatsApp />

      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-hand text-3xl text-blue-600 font-bold border-2 border-red-500 rounded-lg px-3 py-0.5">SatyaSell</span>
          </Link>
          <div className="flex items-center gap-5">
            <a href="#features" className="font-hand text-lg font-bold text-blue-600 hover:text-red-600 transition-colors hidden sm:block">
              Features
            </a>
            <a href="#how-it-works" className="font-hand text-lg font-bold text-blue-600 hover:text-red-600 transition-colors hidden sm:block">
              How It Works
            </a>
            <a href="#demo" className="font-hand text-lg font-bold text-blue-600 hover:text-red-600 transition-colors hidden sm:block">
              Demo
            </a>
            <Link
              href="/client/login"
              className="font-hand px-5 py-2 text-lg font-bold rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-hand text-4xl sm:text-5xl lg:text-6xl text-blue-600 leading-tight">
              Smart WhatsApp
              <br />
              Auto Ordering System
            </h1>
            <p className="mt-6 font-hand text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Your customers message on WhatsApp. System handles the rest — products, address, payment, order.
              <strong className="text-gray-900"> You just sit back.</strong>
            </p>

            {/* Highlight Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-10">
              <SketchBox strokeColor="#dc2626" roughness={2} strokeWidth={2.5} padding="px-5 py-3">
                <span className="font-hand text-xl sm:text-2xl text-red-600 font-bold">NO PRICING PLANS</span>
              </SketchBox>
              <SketchBox strokeColor="#dc2626" roughness={2} strokeWidth={2.5} padding="px-5 py-3">
                <span className="font-hand text-xl sm:text-2xl text-red-600 font-bold">NO SUBSCRIPTION</span>
              </SketchBox>
            </div>
            <p className="mt-6 font-hand text-lg text-gray-700">
              Pay only <SketchUnderline strokeColor="#dc2626"><strong className="text-red-600 text-xl">1% per order</strong></SketchUnderline> when you get an order.
              No order? Pay <strong className="text-blue-600">&#8377;0</strong>. Nothing.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
              <a
                href="#demo"
                className="font-hand px-8 py-3.5 text-lg font-bold rounded-xl border-2 border-red-500 text-red-600 hover:bg-red-50 transition-colors"
              >
                Book a Free Demo
              </a>
              <a
                href="#how-it-works"
                className="font-hand px-8 py-3.5 text-lg font-bold rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                See How It Works
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: Vision Flow Diagram */}
          <div className="flex justify-center lg:justify-end">
            <VisionFlow />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-blue-600 text-center mb-4">
            How It Works
          </h2>
          <p className="text-center font-hand text-lg text-gray-600 mb-12 max-w-xl mx-auto">
            From customer message to order on your dashboard — all automatic
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowSteps.map((step, i) => (
              <SketchBox
                key={i}
                roughness={1.2 + (i % 3) * 0.3}
                strokeColor="#2563EB"
                className="bg-white"
                padding="p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center">
                      <span className="font-hand text-xl text-red-600 font-bold">{i + 1}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
                      <h3 className="font-hand font-bold text-blue-800 text-base">{step.title}</h3>
                    </div>
                    <p className="font-hand text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              </SketchBox>
            ))}
          </div>

          <p className="text-center mt-10 font-hand text-2xl sm:text-3xl text-blue-600 font-bold">
            All of this happens automatically. No effort from you!
          </p>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-red-600 text-center mb-10">
            Are You Tired Of...
          </h2>

          <div className="space-y-4">
            {painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-hand text-red-500 font-bold text-xl flex-shrink-0 mt-0.5">&#10007;</span>
                <p className="font-hand text-gray-700 text-lg line-through decoration-red-400 decoration-2">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <SketchBox strokeColor="#2563EB" roughness={1.8} strokeWidth={3} className="bg-white" padding="p-6 sm:p-8">
              <p className="text-center font-hand text-2xl sm:text-3xl text-blue-600">
                SatyaSell handles all of this.
                <br />
                <SketchUnderline strokeColor="#dc2626" strokeWidth={3}>
                  <span className="text-red-600 font-bold">Save 99% of your time.</span>
                </SketchUnderline>
              </p>
            </SketchBox>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-blue-600 text-center mb-4">
            What You Get
          </h2>
          <p className="text-center font-hand text-lg text-gray-600 mb-12 max-w-xl mx-auto">
            Everything you need to sell on WhatsApp without any effort
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <SketchBox
                key={i}
                roughness={1.3 + (i % 3) * 0.2}
                strokeColor="#2563EB"
                className="bg-white hover:bg-blue-50/50 transition-colors"
                padding="p-6"
              >
                <feature.icon className="h-10 w-10 text-blue-600 mb-3" strokeWidth={1.5} />
                <h3 className="font-hand text-xl text-blue-600 mb-2 font-bold">{feature.title}</h3>
                <p className="font-hand text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </SketchBox>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-blue-600 text-center mb-10">
            Simplest Pricing Ever
          </h2>

          <SketchBox strokeColor="#dc2626" roughness={1.5} strokeWidth={3} padding="p-8 sm:p-12">
            <div className="text-center">
              <p className="font-hand text-5xl sm:text-6xl text-red-600 mb-4">100% FREE</p>
              <p className="font-hand text-lg text-gray-700 mb-6">to use. No charges to start.</p>

              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="font-hand text-gray-700">We charge only <strong className="text-red-600">1% per order</strong> — and only when a customer actually pays.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="font-hand text-gray-700">No order? You pay <strong className="text-blue-600">&#8377;0</strong>. Zero. Nothing.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="font-hand text-gray-700">No monthly plans. No yearly plans. No hidden charges.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="font-hand text-gray-700">No credit card or debit card needed to start.</p>
                </div>
              </div>
            </div>
          </SketchBox>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-blue-600 text-center mb-10">
            Your Data is Safe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SketchBox roughness={1.3} strokeColor="#2563EB" className="bg-white" padding="p-6">
              <div className="text-center">
                <Lock className="h-10 w-10 text-blue-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-hand text-base text-gray-700">Your data is stored in a world-class <strong className="text-blue-600">secure database</strong></p>
              </div>
            </SketchBox>
            <SketchBox roughness={1.5} strokeColor="#2563EB" className="bg-white" padding="p-6">
              <div className="text-center">
                <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-hand text-base text-gray-700">No one has access to your data — <strong className="text-blue-600">only you</strong></p>
              </div>
            </SketchBox>
            <SketchBox roughness={1.7} strokeColor="#2563EB" className="bg-white" padding="p-6">
              <div className="text-center">
                <Server className="h-10 w-10 text-blue-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-hand text-base text-gray-700">India&apos;s best and most <strong className="text-red-600">secure payment gateway</strong></p>
              </div>
            </SketchBox>
          </div>
        </div>
      </section>

      {/* ===== UPCOMING ===== */}
      <section className="py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-hand text-2xl text-blue-600 mb-3 font-bold">Coming Soon</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="font-hand px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-full text-base">Product promotions with discounts</span>
            <span className="font-hand px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-full text-base">More smart tools to grow your business</span>
          </div>
        </div>
      </section>

      {/* ===== DEMO FORM ===== */}
      <section id="demo" className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-hand text-3xl sm:text-4xl text-blue-600 text-center mb-3">
            Want to Talk? Book a Free Demo
          </h2>
          <p className="text-center font-hand text-lg text-gray-600 mb-10 max-w-md mx-auto">
            Fill the form below and we will contact you soon
          </p>
          <SketchBox roughness={1.2} strokeColor="#2563EB" strokeWidth={2} className="bg-white max-w-xl mx-auto" padding="p-6 sm:p-10">
            <DemoForm />
          </SketchBox>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t-2 border-blue-200 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-hand text-2xl text-blue-600 font-bold border-2 border-red-500 rounded-lg px-3 py-0.5">SatyaSell</span>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="tel:9515456891" className="flex items-center gap-2 font-hand text-base text-blue-600 hover:text-red-600 transition-colors">
                <Phone className="h-5 w-5" strokeWidth={1.5} />
                9515456891
              </a>
              <a href="mailto:admin@satyasell.com" className="flex items-center gap-2 font-hand text-base text-blue-600 hover:text-red-600 transition-colors">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
                admin@satyasell.com
              </a>
            </div>
          </div>
          <p className="text-center font-hand text-base text-gray-400 mt-6">
            &copy; 2026 SatyaSell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
