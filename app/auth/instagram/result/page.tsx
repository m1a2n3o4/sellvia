import Link from 'next/link';

export const dynamic = 'force-dynamic';

const MSG: Record<string, [string, string]> = {
  connected: ['Instagram connected', 'Your Instagram account is connected to SatyaSell.'],
  denied: ['Connection cancelled', 'Authorisation was cancelled. No data was shared. You can try again anytime.'],
  noaccount: ['No Instagram account found', 'No Instagram business account was selected. Choose an Instagram Business or Creator account and try again.'],
  taken: ['Account already connected', 'This Instagram account is already connected to a different SatyaSell business. Log in to that business, open its Instagram page and choose Disconnect, then connect it here. Or use a different Instagram account.'],
  invalid: ['Link expired', 'This connection link is invalid or expired. Please start again from your dashboard.'],
  unavailable: ['Not available yet', 'Instagram connection is not switched on yet. Please try again later.'],
  error: ['Something went wrong', 'We could not finish connecting Instagram. Please try again, or contact support if it keeps happening.'],
};

export default function Result({ searchParams }: { searchParams: { status?: string } }) {
  const [title, body] = MSG[searchParams.status ?? ''] ?? MSG.error;
  return (
    <main style={{ fontFamily: 'system-ui,sans-serif', maxWidth: '34rem', margin: '12vh auto', padding: '0 1.5rem', lineHeight: 1.55 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ color: '#374151' }}>{body}</p>
      <p>{searchParams.status === 'connected' && <><Link href="/app/channels/instagram">Open your Instagram settings</Link> · </>}<Link href="/client">Back to your dashboard</Link></p>
    </main>
  );
}
