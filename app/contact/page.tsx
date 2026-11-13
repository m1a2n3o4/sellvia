import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us | SatyaSell',
  description: 'Contact SatyaSell by phone, WhatsApp, email or visit our Hyderabad office.',
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us">
      <p>We&apos;re happy to help with questions about SatyaSell, onboarding, billing or your data.</p>
      <ul>
        <li><strong>Business name:</strong> SatyaSell</li>
        <li><strong>Address:</strong> {SITE.addressOneLine}</li>
        <li><strong>Phone / WhatsApp:</strong> <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a></li>
        <li><strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        <li><strong>Website:</strong> <a href={SITE.url}>{SITE.url}</a></li>
      </ul>
      <p>
        Prefer to talk to a person? <a href={SITE.whatsappUrl()}>Chat on WhatsApp</a>.
        We usually reply within one business day.
      </p>
    </LegalLayout>
  );
}
