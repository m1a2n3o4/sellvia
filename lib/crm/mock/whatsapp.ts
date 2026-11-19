// SIMULATED DATA for the WhatsApp module. Not connected to WhatsApp. Replace via lib/crm/services/insights.ts.
export type ChatTag = 'complaint' | 'wants_you' | 'order' | 'ai_handled';
export interface WaMessage { id: string; from: 'customer' | 'ai' | 'owner'; text: string; time: string }
export interface WaChat {
  id: string; name: string; phone: string; day: 'today' | 'yesterday' | 'earlier'; lastTime: string;
  tags: ChatTag[]; unread: number; blocked: boolean; messages: WaMessage[];
}
export interface Complaint { id: string; chatId: string; name: string; reason: string; text: string; ago: string }
export interface WantsYou { id: string; chatId: string; name: string; phone: string; why: string; ago: string }

const phone = (i: number) => `+91 90000 ${String(10000 + i * 37).padStart(5, '0')}`;
const m = (id: string, from: WaMessage['from'], text: string, time: string): WaMessage => ({ id, from, text, time });

const COMPLAINTS: [string, string, string, string][] = [
  ['Rahul Mehta', 'Wrong order', 'Received a gold chain instead of the silver one I ordered.', '12m ago'],
  ['Sunita Rao', 'Bad quality', 'The clasp broke on day 2. This is not acceptable.', '35m ago'],
  ['Imran Qureshi', 'Late delivery', 'My order is 6 days late and nobody updated me.', '1h ago'],
  ['Deepa Nair', 'Payment issue', 'I paid twice and one payment has not come back.', '2h ago'],
  ['Karan Shah', 'Wrong order', 'The ring size is different from what I ordered.', '3h ago'],
  ['Alka Verma', 'Rude reply', 'The reply I got about exchange felt rude.', '4h ago'],
  ['Farah Khan', 'Bad quality', 'Stones look different from the photos.', '5h ago'],
  ['Vivek Joshi', 'Late delivery', 'Gift needed by Friday, still not shipped.', '6h ago'],
  ['Anjali Menon', 'Payment issue', 'Money debited but order not confirmed.', 'Yesterday'],
  ['Rohit Das', 'Wrong order', 'Got the wrong colour in the pair of earrings.', 'Yesterday'],
];
const WANTS: [string, string, string][] = [
  ['Pooja Rathore', 'Wants a custom 22k choker design discussed', '3m ago'],
  ['Meera Joshi', 'Bulk order for a wedding, needs a call', '10m ago'],
  ['Sanjana Reddy', 'Asking about exchange of an old necklace', '18m ago'],
  ['Kabir Singh', 'Wants to negotiate on a high-value order', '25m ago'],
  ['Riya Bansal', 'Needs help choosing a bridal set', '40m ago'],
  ['Anita Desai', 'Wants to visit the store, asks for a callback', '55m ago'],
  ['Naveen Kumar', 'Corporate gifting enquiry', '1h ago'],
  ['Shreya Iyer', 'Not sure about the hallmark details', '1h ago'],
  ['Tarun Gupta', 'Wants a video call to see the piece', '2h ago'],
  ['Lakshmi Venkat', 'Repair request for a family heirloom', '2h ago'],
  ['Harish Patel', 'Asks about financing / EMI options', '3h ago'],
  ['Zoya Ali', 'Wants to talk about a return', '4h ago'],
];

const complaints: Complaint[] = COMPLAINTS.map(([name, reason, text, ago], i) => ({ id: `cp${i}`, chatId: `chat-cp${i}`, name, reason, text, ago }));
const wants: WantsYou[] = WANTS.map(([name, why, ago], i) => ({ id: `wy${i}`, chatId: `chat-wy${i}`, name, phone: phone(i + 20), why, ago }));

const handmade: WaChat[] = [
  { id: 'chat-h1', name: 'Vikramaditya K.', phone: phone(1), day: 'today', lastTime: '10:42 AM', tags: ['order', 'ai_handled'], unread: 0, blocked: false, messages: [
    m('1', 'customer', 'Hi, I saw the Royal Polki Choker on Instagram. What is the price?', '10:31 AM'),
    m('2', 'ai', 'Hello! The Royal Polki Choker Set (22k) is ₹85,000. Weight 46 g, hallmarked. Would you like to order?', '10:31 AM'),
    m('3', 'customer', 'Yes, can I pay by UPI?', '10:36 AM'),
    m('4', 'ai', 'Of course. Here is your secure payment link: satyasell.link/pay/8942', '10:36 AM'),
    m('5', 'ai', 'Payment received. Your order #ORD-8942 is confirmed. We will message you when it ships.', '10:42 AM'),
  ] },
  { id: 'chat-h2', name: 'Neha Mehta', phone: phone(2), day: 'today', lastTime: '10:10 AM', tags: ['ai_handled'], unread: 1, blocked: false, messages: [
    m('1', 'customer', 'Do you have any bridal sets I can see in store?', '10:05 AM'),
    m('2', 'ai', 'Yes! Our Bandra showroom has a Bridal Suite. I can book a VIP appointment. Which day suits you?', '10:05 AM'),
    m('3', 'customer', 'Saturday afternoon.', '10:10 AM'),
  ] },
  { id: 'chat-h3', name: 'Meera J.', phone: phone(3), day: 'today', lastTime: '9:20 AM', tags: ['order'], unread: 0, blocked: false, messages: [
    m('1', 'customer', 'Kundan jhumkas available in 18k?', '9:12 AM'),
    m('2', 'ai', 'These are 22k only. A custom 18k version can be made in 10 days. Shall I share details?', '9:12 AM'),
    m('3', 'customer', 'No, 22k is fine. Order please.', '9:18 AM'),
    m('4', 'ai', 'Done! Your order link: satyasell.link/pay/8951', '9:20 AM'),
  ] },
  { id: 'chat-h4', name: 'Aditi Malhotra', phone: phone(4), day: 'yesterday', lastTime: '6:48 PM', tags: ['ai_handled'], unread: 0, blocked: false, messages: [
    m('1', 'customer', 'Are you open on Sunday?', '6:40 PM'),
    m('2', 'ai', 'Yes, our showrooms are open 11 AM to 8 PM on Sundays.', '6:40 PM'),
    m('3', 'customer', 'Thanks!', '6:48 PM'),
  ] },
  { id: 'chat-h5', name: 'Unknown +91 90000 99999', phone: '+91 90000 99999', day: 'earlier', lastTime: 'Mon', tags: [], unread: 0, blocked: false, messages: [
    m('1', 'customer', 'Free followers!! click this link now', '3:02 PM'),
    m('2', 'ai', 'Sorry, I can only help with questions about our jewellery and orders.', '3:02 PM'),
  ] },
];

const generated: WaChat[] = [
  ...complaints.map((c, i): WaChat => ({
    id: c.chatId, name: c.name, phone: phone(i + 40), day: c.ago === 'Yesterday' ? 'yesterday' : 'today', lastTime: c.ago, tags: ['complaint'], unread: i < 3 ? 1 : 0, blocked: false,
    messages: [m('1', 'customer', c.text, c.ago), m('2', 'ai', `I am sorry about this, ${c.name.split(' ')[0]}. I have flagged it as urgent and the owner will contact you shortly.`, c.ago)],
  })),
  ...wants.map((w, i): WaChat => ({
    id: w.chatId, name: w.name, phone: w.phone, day: 'today', lastTime: w.ago, tags: ['wants_you'], unread: i < 4 ? 1 : 0, blocked: false,
    messages: [m('1', 'customer', `Hi, I would like to talk to someone. ${w.why}.`, w.ago), m('2', 'ai', 'Of course. I have informed the owner and they will get back to you personally.', w.ago)],
  })),
];

export const MOCK_WA = {
  totalCustomers: 1000,
  todayEnquiries: 56,
  map: { chats: 52, newCustomers: 40, enquired: 25, orders: 12, amount: 45600 },
  stopped: { total: 150, today: 25, reasons: [
    { label: 'Not interested', total: 48, today: 8 }, { label: 'Price too high', total: 36, today: 6 },
    { label: 'Just browsing', total: 24, today: 4 }, { label: 'Tech issues (link or payment)', total: 18, today: 3 },
    { label: 'Out of stock', total: 14, today: 3 }, { label: 'Delivery not available', total: 10, today: 1 },
  ] },
  complaints, complaintsTotal: 10,
  complaintReasons: [{ label: 'Wrong order', n: 3 }, { label: 'Bad quality', n: 2 }, { label: 'Late delivery', n: 2 }, { label: 'Payment issue', n: 2 }, { label: 'Rude reply', n: 1 }],
  wants, wantsTotal: 12,
  chats: [...generated.filter((c) => c.tags.includes('wants_you')), ...handmade.slice(0, 3), ...generated.filter((c) => c.tags.includes('complaint')), ...handmade.slice(3)],
  yesterday: { date: 'Yesterday', enquiries: 48, newCustomers: 31, orders: 14, money: 52300, aiHandledPct: 94, avgResponse: '0.8s', complaints: 2, stopped: 20, prev: { enquiries: 41, orders: 10, money: 38400 } },
  helped: { messagesMonth: 1540, minutesPerMessage: 1.5, hoursSaved: 38.5, afterHoursOrders: 17, afterHoursMoney: 96400, week: [4.1, 5.2, 4.8, 6.0, 5.5, 6.4, 6.5] },
  settings: {
    storeName: 'Aura Jewels Mumbai', allowLocation: true, address: 'Shop 12, Linking Road, Bandra West, Mumbai 400050',
    allowPhone: true, phone: '+91 22 0000 0000',
    description: 'Handcrafted 22k gold and polki jewellery. Direct WhatsApp concierge for orders, custom designs and store appointments.',
    maxDiscount: 0, custom: 'Always greet customers by name. Mention free insured delivery on orders above ₹50,000.',
  },
};

export type WaData = typeof MOCK_WA;
