import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About SatyaSell',
  description: 'SatyaSell helps Instagram sellers and small businesses in India take orders and payments on WhatsApp automatically.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About SatyaSell" updated={SITE.effectiveDate}>
      <p>
        SatyaSell is a Telangana-based software company that helps Instagram sellers and small businesses in India take
        orders on WhatsApp without manual back-and-forth. Customers message the seller&apos;s WhatsApp Business number,
        browse products, share their delivery address and pay through a secure payment link, while SatyaSell&apos;s
        smart assistant handles the conversation and the seller manages everything from one dashboard.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>WhatsApp-based product browsing, ordering and order tracking.</li>
        <li>Secure online payment links via Razorpay and Cashfree.</li>
        <li>Product, customer and order management dashboard, with multi-store support.</li>
        <li>AI-assisted replies so sellers can respond to customers instantly.</li>
      </ul>
      <h2>Business registration</h2>
      <p>{SITE.registrationLine}</p>
      <h2>Registered address</h2>
      <p>{SITE.addressOneLine}</p>
    </LegalLayout>
  );
}
