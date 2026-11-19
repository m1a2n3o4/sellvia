import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | SatyaSell',
  description: 'How to request deletion of your data from SatyaSell.',
};

export default function DataDeletionPage() {
  return (
    <LegalLayout title="User Data Deletion Instructions" updated="20 November 2026">
      <p>
        You can ask SatyaSell to delete the personal data we hold about you at any time. This applies to Sellers and to
        customers who have interacted with a Seller through WhatsApp, Instagram or a storefront.
      </p>

      <h2>How to request deletion</h2>
      <ul>
        <li>
          Email <a href={`mailto:${SITE.email}?subject=Data%20Deletion%20Request`}>{SITE.email}</a> with the subject{' '}
          <strong>&quot;Data Deletion Request&quot;</strong>.
        </li>
        <li>Include the mobile number (and WhatsApp number, if different) linked to your data, and the store name if you are a customer.</li>
        <li>Or message us on WhatsApp at <a href={`https://wa.me/${SITE.whatsappNumber}`}>{SITE.phoneDisplay}</a> with the same details.</li>
      </ul>

      <h2>What happens next</h2>
      <ul>
        <li>We verify that the request comes from the owner of that mobile number (for example by OTP).</li>
        <li>We delete or anonymise your profile, chat messages, addresses and uploaded images within <strong>30 days</strong>, and confirm by email or WhatsApp.</li>
        <li>Seller accounts: your catalogue, customers and store data are removed and your storefront stops working.</li>
        <li>Some records, such as order and payment records, may be kept for as long as tax, accounting or legal rules require, and are then deleted.</li>
        <li>Data already held by third parties (for example Meta/WhatsApp or payment providers) is governed by their own policies; we will remove what we control.</li>
      </ul>

      <h2>Instagram data</h2>
      <p>If a Seller connected an Instagram account to SatyaSell, or you sent a direct message to a connected account, you can remove that data in any of these ways:</p>
      <ul>
        <li>
          <strong>Disconnect in SatyaSell (Sellers):</strong> open the Instagram page in your SatyaSell dashboard and choose
          <strong>Disconnect</strong>. This deletes our access token and stops us saving new messages. Tick{' '}
          <strong>&quot;Also permanently delete the stored messages&quot;</strong> to remove the saved messages too.
        </li>
        <li>
          <strong>Remove the app in Instagram:</strong> in Instagram go to Settings &gt; Apps and websites (or Website
          permissions), find SatyaSell and remove it. Instagram then notifies us and we automatically delete the Instagram
          connection and the messages stored for it. We return a confirmation code, and you can check progress on this page.
        </li>
        <li>
          <strong>Ask us:</strong> email <a href={`mailto:${SITE.email}?subject=Instagram%20Data%20Deletion%20Request`}>{SITE.email}</a> with
          the subject <strong>&quot;Instagram Data Deletion Request&quot;</strong> and your Instagram username. We delete the
          data within <strong>30 days</strong> and confirm by email.
        </li>
      </ul>

      <h2>Stop receiving messages</h2>
      <p>
        Reply <strong>STOP</strong> to any WhatsApp message to opt out, or block the business number. See the{' '}
        <a href="/privacy-policy">Privacy Policy</a> for more.
      </p>
    </LegalLayout>
  );
}
