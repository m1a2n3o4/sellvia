// SIMULATED DATA for the dashboard preview (jewellery sample business).
export interface FeedItem {
  id: string; initials: string; name: string; source: string; time: string; message: string;
  amount: string; unread: boolean; action: { label: string; href: string; tone: 'brand' | 'outline' | 'soft' };
}
export interface DashboardData {
  gross: { value: string; delta: string; vs: string; bars: number[] };
  leads: { active: number; highIntent: number; awaiting: string; slaPct: number; slaLabel: string };
  recovered: { value: string; note: string; botConv: string };
  ai: { avg: string; rate: string; note: string; integrations: string[]; live: number };
  feed: FeedItem[]; totalInteractions: number;
  campaign: { tag: string; title: string; blurb: string; revenue: string };
  health: { name: string; value: string }[];
  extensions: { tag: string; title: string; body: string; footer: string; cta: string; href: string }[];
}

export const MOCK_DASHBOARD: DashboardData = {
  gross: { value: '₹1,42,850', delta: '+18.2%', vs: 'vs. ₹1,20,800 yesterday', bars: [30, 38, 34, 52, 46, 58, 100] },
  leads: { active: 38, highIntent: 4, awaiting: '12 awaiting gold quote', slaPct: 92, slaLabel: '92% within 3m' },
  recovered: { value: '₹34,500', note: '8 checkouts auto-nudged', botConv: '24.6%' },
  ai: { avg: '0.8s Avg', rate: '98.4%', note: 'Meta & WA API connected', integrations: ['IG', 'WA', 'API'], live: 3 },
  feed: [
    { id: 'f1', initials: 'PR', name: 'Pooja Rathore', source: 'Instagram DM', time: '2m ago', unread: true,
      message: 'Requested custom price estimate for 22k Kundan Polki Choker', amount: '₹85,000 Est.',
      action: { label: 'Generate Quote', href: '/app/sales/quotations', tone: 'brand' } },
    { id: 'f2', initials: 'VK', name: 'Vikramaditya K.', source: 'WhatsApp Pay', time: '14m ago', unread: false,
      message: 'UPI link settlement confirmed • Order #ORD-8942-IN', amount: '₹42,500 Paid',
      action: { label: 'Print GST', href: '/app/sales/orders', tone: 'soft' } },
    { id: 'f3', initials: 'NM', name: 'Neha Mehta', source: 'Store Consultation', time: '32m ago', unread: false,
      message: 'Booked Bandra Showroom VIP Bridal Appointment for Oct 26', amount: 'Bridal Suite',
      action: { label: 'Assign Stylist', href: '/app/sales/appointments', tone: 'soft' } },
  ],
  totalInteractions: 148,
  campaign: { tag: 'Festival Drop', title: 'Diwali Heritage Edit', blurb: '14,200 broadcast contacts. 42 orders closed directly in WhatsApp chat.', revenue: '₹8,92,400' },
  health: [
    { name: 'NLP Intent Engine', value: '12ms' },
    { name: 'Razorpay Webhook QR', value: '100% Up' },
    { name: 'TallyPrime GST Sync', value: 'In 4m' },
  ],
  extensions: [
    { tag: 'Deals', title: 'Bespoke Jewelry Quotations', body: 'Pipeline view for customised ornaments requiring karigar estimation & hallmark approval.', footer: '7 Drafts Pending Review', cta: 'Open', href: '/app/sales/quotations' },
    { tag: 'MCX Live', title: '24K Bullion Price Index', body: 'Real-time MCX market linkage to instantly compute product retail markup based on gram weight.', footer: '₹7,240 / gm (+0.4%)', cta: 'Open', href: '/app/catalogue/products' },
  ],
};
