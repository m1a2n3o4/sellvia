import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | SatyaSell',
  description: 'How SatyaSell collects, uses, stores and protects personal data, including data processed through WhatsApp and Instagram.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="20 November 2026">
      <p>
        SatyaSell (&quot;SatyaSell&quot;, &quot;we&quot;, &quot;us&quot;) provides a software platform that helps
        small businesses and sellers (&quot;Sellers&quot;) take and manage orders from their customers through WhatsApp and Instagram.
        This policy explains what personal data we collect, why, how we protect it, and the choices you have. It applies
        to our website <a href={SITE.url}>{SITE.url}</a>, the seller dashboard, seller storefronts, and our WhatsApp
        and Instagram messaging services.
      </p>

      <h2>1. Who is responsible for your data</h2>
      <p>
        For data of Sellers who register with us, SatyaSell is the data controller. For data of a Seller&apos;s
        customers (people who message a Seller on WhatsApp or order from a Seller&apos;s storefront), the Seller decides
        why the data is collected and SatyaSell processes it on the Seller&apos;s behalf as a data processor.
      </p>

      <h2>2. Information we collect</h2>
      <h3>From Sellers</h3>
      <ul>
        <li>Name, mobile number, email address, business/store name, address, and Instagram or website links.</li>
        <li>Login credentials (your PIN is stored only as a one-way hash; we cannot read it).</li>
        <li>Product catalogue data: names, descriptions, prices, stock, images, and barcodes you add.</li>
        <li>Business WhatsApp configuration details needed to connect your WhatsApp Business account.</li>
        <li>Contact-form details you submit on our website (name, mobile number, Instagram link, website).</li>
      </ul>
      <h3>From Sellers&apos; customers</h3>
      <ul>
        <li>WhatsApp phone number and profile name.</li>
        <li>Instagram: the Instagram-scoped ID of a person who sends a message to a Seller&apos;s connected Instagram account, their Instagram username or name where Instagram provides it, and the content and time of those messages and of the replies the Seller sends.</li>
        <li>The content of messages sent to a Seller&apos;s business number, including text, voice notes and images shared to place or enquire about an order (and, for Instagram, the text of direct messages).</li>
        <li>Delivery name, address and order details (items, quantity, amount, status).</li>
        <li>Verification codes (OTP) used to confirm a phone number at checkout.</li>
      </ul>
      <h3>Collected automatically</h3>
      <ul>
        <li>Basic technical data such as browser type, device, pages visited and approximate usage statistics, used to keep the service secure and improve it.</li>
        <li>Essential cookies used to keep Sellers logged in.</li>
      </ul>

      <h2>3. How we use information</h2>
      <ul>
        <li>To operate the ordering service: show products, take orders, collect addresses, and generate payment links.</li>
        <li>To show a Seller the Instagram messages sent to their business account and let the Seller reply from the SatyaSell Inbox.</li>
        <li>To send order-related WhatsApp messages (order confirmations, payment and delivery updates) and replies to customer enquiries.</li>
        <li>To generate automated replies using AI so Sellers can respond to customers faster.</li>
        <li>To authenticate users, prevent fraud and abuse, and secure the platform.</li>
        <li>To provide support, respond to enquiries, and send service notices.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>We do <strong>not</strong> sell personal data, and we do not use customer data for advertising.</p>

      <h2>4. WhatsApp, Instagram and Meta</h2>
      <p>
        Messages are sent and received through the WhatsApp Business Platform (Cloud API) provided by Meta Platforms,
        Inc. Messages are processed by Meta under its own terms and privacy policy. We only message people who have
        contacted a Seller first or have otherwise opted in to receive order-related communication, and we follow the
        WhatsApp Business Messaging and Commerce policies. Anyone can stop receiving messages by replying
        &quot;STOP&quot; or by contacting us.
      </p>

      <h3>Instagram (Meta)</h3>
      <p>
        A Seller can connect their Instagram professional (Business or Creator) account to SatyaSell by signing in on
        Meta&apos;s own login page. We never see or store the Seller&apos;s Instagram password. After the Seller
        approves, we receive an access token, which we store encrypted, and we use it only to:
      </p>
      <ul>
        <li>read the connected account&apos;s name and ID;</li>
        <li>receive the direct messages that people send to that account, and show them to the Seller in the SatyaSell Inbox;</li>
        <li>send a reply that the Seller writes, to a person who has messaged the account, within the 24-hour window Instagram allows.</li>
      </ul>
      <p>
        We do not access the Seller&apos;s followers list, other people&apos;s private data, or content unrelated to the
        messages above, and we do not post to the account. Instagram messages are stored for the Seller, are not shared
        with other Sellers, and are not sold or used for advertising. Instagram messages are currently only stored and
        shown to the Seller; if we later offer automated (AI) replies on Instagram, we will update this policy before
        switching that on.
      </p>
      <p>
        A Seller can disconnect Instagram at any time from the Instagram page in the SatyaSell dashboard: this deletes
        our access token and we stop saving new messages, and the Seller can choose to delete the stored messages at the
        same time. A Seller or any person can also remove SatyaSell in Instagram&apos;s settings (Apps and websites), or
        ask us to delete data using the steps on our <a href="/data-deletion">Data Deletion</a> page. Removing the app
        in Instagram ends our access, and if a deletion of data is also requested through Instagram/Meta, we delete the
        connection and the messages we hold for it automatically.
      </p>

      <h2>5. Service providers we share data with</h2>
      <p>We share data only with providers needed to run the service, under appropriate safeguards:</p>
      <ul>
        <li><strong>Meta (WhatsApp Business Platform and Instagram)</strong> &ndash; message delivery and receipt.</li>
        <li><strong>OpenAI</strong> &ndash; to generate automated replies and analyse product images or voice notes. Content sent for this purpose is limited to what is needed for the request.</li>
        <li><strong>Supabase</strong> &ndash; database and file storage.</li>
        <li><strong>Vercel</strong> &ndash; website hosting and delivery.</li>
        <li><strong>Razorpay and Cashfree</strong> &ndash; payment processing. Card, UPI and bank details are entered on the payment provider&apos;s page; we never see or store them.</li>
        <li><strong>SMS providers</strong> &ndash; to deliver OTP verification codes.</li>
      </ul>
      <p>
        We may also disclose data to the relevant Seller (for their own customers&apos; orders), or where required by law
        or to protect rights and safety.
      </p>

      <h2>6. Data storage, security and transfers</h2>
      <p>
        Data is stored in secured cloud databases. We use encryption in transit (HTTPS/TLS), hashed credentials,
        tenant-level data separation so one Seller cannot see another Seller&apos;s data, role-based access, and
        verification of incoming webhook requests. No system is perfectly secure, but we work to protect your data and
        will notify affected users of a serious breach as required by law. Our providers may process data in
        countries outside India, in which case we rely on their contractual and technical safeguards.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep data for as long as a Seller&apos;s account is active and as needed to provide the service. Order and
        payment records may be kept for the period required by applicable tax and accounting laws. When data is no longer
        needed, or on a valid deletion request, it is deleted or anonymised. See our{' '}
        <a href="/data-deletion">Data Deletion</a> page.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Subject to applicable law (including India&apos;s Digital Personal Data Protection Act, 2023), you may request to
        access, correct, update or delete your personal data, withdraw consent, or raise a grievance. To exercise these
        rights, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. If you are a Seller&apos;s customer, you may also
        contact the Seller directly. We will respond within a reasonable time, and in any case within 30 days.
      </p>

      <h2>9. Children</h2>
      <p>
        Our services are not directed to children under 18, and we do not knowingly collect their personal data. If you
        believe a child has provided us data, contact us and we will delete it.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use only essential cookies (for example, to keep you logged in) and basic usage measurement. You can control
        cookies through your browser settings, though the seller dashboard may not work without essential cookies.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &quot;Last updated&quot; date above shows the latest version.
        Material changes will be highlighted on our website.
      </p>

      <h2>12. Contact and grievance officer</h2>
      <p>
        For privacy questions, requests or complaints, contact SatyaSell at{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, phone <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>,
        or write to {SITE.addressOneLine}.
      </p>
    </LegalLayout>
  );
}
