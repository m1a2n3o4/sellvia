// SIMULATED DATA for the Instagram channel. Not connected to Meta. Replace via lib/crm/services/insights.ts.
export type InvStatus = 'live' | 'stopped' | 'out_of_stock';

export interface IgComment { id: string; user: string; text: string; replied: boolean; reply?: string }
export interface IgJourney {
  id: string; customer: string; sentAt: string; aiMessage: string; link: 'WhatsApp' | 'Web';
  opened: boolean; outcome: 'ordered' | 'stopped' | 'pending'; stoppedAt?: string; reason?: string;
}
export interface IgOrder { id: string; customer: string; amount: string; channel: 'WhatsApp' | 'Web'; status: string }
export interface IgPost {
  id: string; kind: 'Reel' | 'Post'; title: string; caption: string; postedOn: string; duration?: string;
  commentsTotal: number; commentsReplied: number; comments: IgComment[];
  dms: number; journeys: IgJourney[];
  waOpens: number; webOpens: number; ordered: number; stopped: number; topStopReason: string;
  revenue: number; orders: IgOrder[];
  product: { name: string; sku: string; stock: number; status: InvStatus };
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
export { inr };

export const MOCK_POSTS: IgPost[] = [
  {
    id: 'p1', kind: 'Reel', title: 'Royal Polki Choker Set 22k', caption: 'Heirloom craftsmanship for royal brides…', postedOn: 'Oct 12', duration: '0:38',
    commentsTotal: 25, commentsReplied: 23,
    comments: [
      { id: 'c1', user: 'pooja.rathore', text: 'Price please?', replied: true, reply: 'Hi Pooja! The Royal Polki Choker Set is ₹85,000. Tap the link in your DM to order on WhatsApp.' },
      { id: 'c2', user: 'meera_j', text: 'Is this available in 18k?', replied: true, reply: 'Hi Meera! This set is 22k only. We can make a custom 18k version, check your DM for details.' },
      { id: 'c3', user: 'sanjana.r', text: 'Delivery to Pune?', replied: true, reply: 'Yes, we deliver insured to Pune in 3 to 4 days. Link sent to your DM.' },
      { id: 'c4', user: 'kabir.s', text: 'Rate kya hai?', replied: false },
      { id: 'c5', user: 'riya_bridal', text: 'Can I see it in store?', replied: false },
    ],
    dms: 21,
    journeys: [
      { id: 'j1', customer: 'Vikramaditya K.', sentAt: '2m after comment', aiMessage: 'Hi! Here is the Royal Polki Choker Set (₹85,000) with weight and hallmark details. Order on WhatsApp: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'ordered' },
      { id: 'j2', customer: 'Meera J.', sentAt: '5m after comment', aiMessage: 'Thanks for your interest! View and order online: satyasell.link/…', link: 'Web', opened: true, outcome: 'ordered' },
      { id: 'j3', customer: 'Riya B.', sentAt: '9m after comment', aiMessage: 'Hi Riya! Here are the details and a link to order: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'stopped', stoppedAt: 'After price quote', reason: 'Price higher than expected' },
      { id: 'j4', customer: 'Anita D.', sentAt: '14m after comment', aiMessage: 'Hello Anita! Order link for the Royal Polki Choker: satyasell.link/…', link: 'Web', opened: false, outcome: 'pending' },
    ],
    waOpens: 11, webOpens: 6, ordered: 4, stopped: 9, topStopReason: 'Price higher than expected',
    revenue: 347000,
    orders: [
      { id: '#ORD-8942', customer: 'Vikramaditya K.', amount: inr(85000), channel: 'WhatsApp', status: 'Paid' },
      { id: '#ORD-8951', customer: 'Meera J.', amount: inr(92000), channel: 'Web', status: 'Paid' },
      { id: '#ORD-8960', customer: 'Sanjana R.', amount: inr(85000), channel: 'WhatsApp', status: 'Payment pending' },
      { id: '#ORD-8977', customer: 'Kabir S.', amount: inr(85000), channel: 'Web', status: 'Paid' },
    ],
    product: { name: 'Royal Polki Choker Set 22k', sku: 'JW-PLK-014', stock: 6, status: 'live' },
  },
  {
    id: 'p2', kind: 'Post', title: 'Bridal Kundan Jhumkas', caption: 'Pure 22k gold with uncut rubies…', postedOn: 'Oct 18',
    commentsTotal: 18, commentsReplied: 18,
    comments: [
      { id: 'c1', user: 'nidhi_k', text: 'Weight of the pair?', replied: true, reply: 'Hi Nidhi! The pair weighs 38 g. Full specs are in your DM.' },
      { id: 'c2', user: 'tanvi.m', text: 'Love these! Price?', replied: true, reply: 'Thank you Tanvi! They are ₹72,000. Order link sent to your DM.' },
    ],
    dms: 14,
    journeys: [
      { id: 'j1', customer: 'Nidhi K.', sentAt: '3m after comment', aiMessage: 'Hi Nidhi! 38 g pair, 22k gold, ₹72,000. Order here: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'ordered' },
      { id: 'j2', customer: 'Tanvi M.', sentAt: '7m after comment', aiMessage: 'Thank you! Details and order link: satyasell.link/…', link: 'Web', opened: true, outcome: 'stopped', stoppedAt: 'At checkout', reason: 'Wanted to see it in store first' },
    ],
    waOpens: 7, webOpens: 3, ordered: 3, stopped: 4, topStopReason: 'Wanted to see it in store first',
    revenue: 210000,
    orders: [
      { id: '#ORD-8903', customer: 'Nidhi K.', amount: inr(72000), channel: 'WhatsApp', status: 'Paid' },
      { id: '#ORD-8915', customer: 'Aarti P.', amount: inr(68000), channel: 'WhatsApp', status: 'Paid' },
      { id: '#ORD-8921', customer: 'Shreya V.', amount: inr(70000), channel: 'Web', status: 'Paid' },
    ],
    product: { name: 'Bridal Kundan Jhumkas', sku: 'JW-KND-032', stock: 5, status: 'live' },
  },
  {
    id: 'p3', kind: 'Reel', title: 'Temple Kada Bangles (Karigar Series)', caption: 'Behind the scenes with Master Ramesh…', postedOn: 'Oct 04', duration: '0:52',
    commentsTotal: 41, commentsReplied: 33,
    comments: [
      { id: 'c1', user: 'lakshmi.v', text: 'Can I get a custom size?', replied: true, reply: 'Yes! Sizes 2.2 to 2.8 are available. Check your DM for the size chart.' },
      { id: 'c2', user: 'divya_s', text: 'Is this still available?', replied: false },
      { id: 'c3', user: 'harini.n', text: 'Price for 2 bangles?', replied: false },
    ],
    dms: 37,
    journeys: [
      { id: 'j1', customer: 'Lakshmi V.', sentAt: '2m after comment', aiMessage: 'Hi Lakshmi! Size chart and custom order link: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'ordered' },
      { id: 'j2', customer: 'Divya S.', sentAt: '11m after comment', aiMessage: 'Hello Divya! Check availability and order: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'stopped', stoppedAt: 'After size chart', reason: 'Size not available' },
    ],
    waOpens: 18, webOpens: 4, ordered: 2, stopped: 11, topStopReason: 'Size not available',
    revenue: 138000,
    orders: [
      { id: '#ORD-8810', customer: 'Lakshmi V.', amount: inr(69000), channel: 'WhatsApp', status: 'Paid' },
      { id: '#ORD-8832', customer: 'Gayatri R.', amount: inr(69000), channel: 'WhatsApp', status: 'Paid' },
    ],
    product: { name: 'Temple Kada Bangles', sku: 'JW-KDA-007', stock: 0, status: 'out_of_stock' },
  },
  {
    id: 'p4', kind: 'Reel', title: 'Solitaire Everyday Ring Edit', caption: 'Subtle luxury for every boardroom…', postedOn: 'Oct 22', duration: '0:18',
    commentsTotal: 12, commentsReplied: 12,
    comments: [{ id: 'c1', user: 'priya.corp', text: 'Does it come with a certificate?', replied: true, reply: 'Yes, every solitaire ships with an IGI certificate. Details in your DM.' }],
    dms: 9,
    journeys: [
      { id: 'j1', customer: 'Priya C.', sentAt: '4m after comment', aiMessage: 'Hi Priya! IGI certified solitaire ring, ₹14,700. Order: satyasell.link/…', link: 'Web', opened: true, outcome: 'ordered' },
      { id: 'j2', customer: 'Rohan T.', sentAt: '8m after comment', aiMessage: 'Hello Rohan! Ring details and order link: satyasell.link/…', link: 'Web', opened: false, outcome: 'pending' },
    ],
    waOpens: 3, webOpens: 4, ordered: 3, stopped: 2, topStopReason: 'No reply after quote',
    revenue: 44100,
    orders: [
      { id: '#ORD-9004', customer: 'Priya C.', amount: inr(14700), channel: 'Web', status: 'Paid' },
      { id: '#ORD-9011', customer: 'Aditi M.', amount: inr(14700), channel: 'Web', status: 'Paid' },
      { id: '#ORD-9016', customer: 'Sneha L.', amount: inr(14700), channel: 'WhatsApp', status: 'Paid' },
    ],
    product: { name: 'Solitaire Everyday Ring', sku: 'JW-SOL-021', stock: 14, status: 'live' },
  },
  {
    id: 'p5', kind: 'Post', title: 'Heritage Silver Pooja Set', caption: 'Festive silver, hallmarked 925…', postedOn: 'Sep 28',
    commentsTotal: 9, commentsReplied: 5,
    comments: [
      { id: 'c1', user: 'usha.g', text: 'Price?', replied: false },
      { id: 'c2', user: 'rekha_p', text: 'Is it hallmarked?', replied: true, reply: 'Yes, 925 hallmarked. Details are in your DM.' },
    ],
    dms: 6,
    journeys: [{ id: 'j1', customer: 'Rekha P.', sentAt: '6m after comment', aiMessage: 'Hi Rekha! 925 hallmarked silver pooja set, ₹9,800. Order: satyasell.link/…', link: 'WhatsApp', opened: true, outcome: 'ordered' }],
    waOpens: 2, webOpens: 1, ordered: 1, stopped: 2, topStopReason: 'Festival season over',
    revenue: 9800,
    orders: [{ id: '#ORD-8704', customer: 'Rekha P.', amount: inr(9800), channel: 'WhatsApp', status: 'Paid' }],
    product: { name: 'Heritage Silver Pooja Set', sku: 'JW-SLV-003', stock: 9, status: 'stopped' },
  },
];

export const MOCK_IG = {
  name: 'Aura Jewels Mumbai', handle: 'aurajewels_mumbai', category: 'Jewellery & Watches', verified: true,
  postsCount: '420', followers: '148K', following: '312',
  bio: ['Handcrafted heritage jewellery 💎', 'Fine 22k gold & polki | Bandra & Colaba', 'WhatsApp concierge & custom karigar estimates ↓'],
  link: 'aurajewels.example/shop',
  stopReasons: [
    { label: 'Price higher than expected', n: 12 },
    { label: 'Wanted to see it in store first', n: 8 },
    { label: 'Size / weight not available', n: 5 },
    { label: 'No reply after quote', n: 3 },
  ],
};
