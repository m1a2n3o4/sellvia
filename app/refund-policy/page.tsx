import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | SatyaSell',
  description: 'Refund, cancellation and shipping information for orders placed through SatyaSell sellers.',
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <h2>1. Orders placed with a Seller</h2>
      <p>
        Products ordered through SatyaSell WhatsApp ordering or storefronts are sold and delivered by the individual
        Seller, not by SatyaSell. Each Seller sets and is responsible for their own cancellation, return, replacement,
        refund and delivery terms, which they should communicate to customers before payment.
      </p>
      <ul>
        <li><strong>Cancellations:</strong> contact the Seller on the WhatsApp number you ordered from as soon as possible. Orders may not be cancellable once shipped.</li>
        <li><strong>Damaged, defective or wrong items:</strong> report to the Seller with photos promptly after delivery.</li>
        <li><strong>Refunds:</strong> approved refunds are returned to the original payment method through the payment provider, typically within 5&ndash;7 working days after approval.</li>
        <li><strong>Shipping:</strong> timelines and charges are set by the Seller and shown at checkout.</li>
      </ul>

      <h2>2. Unresolved issues</h2>
      <p>
        If a Seller does not respond or resolve your issue, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with
        your order details and we will help liaise with the Seller.
      </p>

      <h2>3. SatyaSell subscription and service fees</h2>
      <p>
        Fees paid to SatyaSell for the platform are generally non-refundable once the service period has begun, except
        where required by law or agreed in writing. Contact us within 7 days of a charge if you believe it was made in
        error.
      </p>
    </LegalLayout>
  );
}
