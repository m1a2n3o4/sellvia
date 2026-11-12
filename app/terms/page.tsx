import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service | SatyaSell',
  description: 'The terms that govern use of the SatyaSell WhatsApp ordering platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These Terms govern your use of SatyaSell&apos;s website, seller dashboard, storefronts and WhatsApp ordering
        service (the &quot;Service&quot;). By registering or using the Service you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        SatyaSell lets Sellers present products, receive orders, collect delivery details and share payment links with
        their customers through WhatsApp and online storefronts, with optional AI-assisted replies. SatyaSell is a
        technology provider. The sale of goods is a contract between the Seller and their customer; SatyaSell is not
        the seller of those goods.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>Sellers must provide accurate information and be at least 18 years old and legally able to run their business.</li>
        <li>You are responsible for keeping your PIN and account secure and for all activity under your account.</li>
        <li>Accounts are created by or with SatyaSell and may be suspended for misuse or non-payment.</li>
      </ul>

      <h2>3. Seller responsibilities</h2>
      <ul>
        <li>You are responsible for your products, prices, descriptions, stock, fulfilment, delivery, returns and customer service, and for complying with applicable laws, including consumer-protection, tax and GST rules.</li>
        <li>You must not sell prohibited, illegal, counterfeit or restricted items, or items prohibited by the WhatsApp Commerce Policy.</li>
        <li>You must only message customers who have contacted you or have opted in, and honour opt-out requests.</li>
        <li>You must comply with the WhatsApp Business Terms of Service and Business Messaging Policy, and with Meta&apos;s other applicable policies.</li>
      </ul>

      <h2>4. Fees and payments</h2>
      <p>
        Fees are as shown on our website or agreed with you in writing, including any per-order fee. Customer payments
        are processed by third-party payment providers (such as Razorpay or Cashfree) under their own terms. Fees of
        those providers and applicable taxes may apply. Meta may charge separately for WhatsApp conversations or
        messages.
      </p>

      <h2>5. AI-generated replies</h2>
      <p>
        The Service uses AI to draft and send automated replies. AI output may occasionally be incomplete or incorrect.
        Sellers should review their catalogue and settings regularly and are responsible for the information their
        store communicates to customers.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to: misuse or attempt to disrupt or gain unauthorised access to the Service; send spam or unlawful, deceptive or harassing content; infringe others&apos; rights; reverse-engineer the Service; or use it to violate any law.</p>

      <h2>7. Intellectual property</h2>
      <p>
        SatyaSell and its software, design and branding belong to us. You keep ownership of the content you upload and
        grant us a limited licence to host and process it solely to provide the Service.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Our handling of personal data is described in the <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>9. Availability and third-party services</h2>
      <p>
        We aim for reliable service but do not guarantee uninterrupted availability. The Service depends on third
        parties such as Meta/WhatsApp, payment gateways and cloud hosts, whose outages or policy changes are outside our
        control.
      </p>

      <h2>10. Disclaimer and limitation of liability</h2>
      <p>
        The Service is provided &quot;as is&quot;. To the maximum extent permitted by law, SatyaSell is not liable for
        indirect or consequential loss, lost profits or lost data, and our total liability for any claim is limited to
        the fees you paid us in the three months before the claim arose.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        You may stop using the Service at any time and request account deletion (see{' '}
        <a href="/data-deletion">Data Deletion</a>). We may suspend or terminate access for breach of these Terms or
        legal or policy requirements.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of India. Courts at Hyderabad, Telangana have exclusive jurisdiction,
        subject to applicable law.
      </p>

      <h2>13. Changes and contact</h2>
      <p>
        We may update these Terms; continued use after changes means you accept them. Questions:{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalLayout>
  );
}
