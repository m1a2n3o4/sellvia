// SIMULATED customers. Replace via lib/crm/services/crm-data.ts.
export type CustomerSource = 'WhatsApp' | 'Instagram' | 'Website' | 'Walk-in';
export type Segment = 'vip' | 'new' | 'regular' | 'follow_up';
export interface Customer {
  id: string; name: string; phone: string; email?: string; city: string; source: CustomerSource; segment: Segment;
  orders: number; spent: number; lastContact: string; notes: string[]; activity: { id: string; text: string; time: string }[];
}

const rows: [string, string, string, CustomerSource, Segment, number, number, string][] = [
  ['Vikramaditya K.', 'Mumbai', '+91 90000 10037', 'Instagram', 'vip', 9, 412000, '2h ago'],
  ['Neha Mehta', 'Mumbai', '+91 90000 10074', 'WhatsApp', 'regular', 3, 96000, '3h ago'],
  ['Meera Joshi', 'Pune', '+91 90000 10111', 'WhatsApp', 'follow_up', 1, 28000, '10m ago'],
  ['Pooja Rathore', 'Delhi', '+91 90000 10148', 'Instagram', 'follow_up', 0, 0, '3m ago'],
  ['Rahul Mehta', 'Mumbai', '+91 90000 10185', 'Website', 'follow_up', 2, 54000, '12m ago'],
  ['Sunita Rao', 'Hyderabad', '+91 90000 10222', 'WhatsApp', 'follow_up', 1, 18500, '35m ago'],
  ['Aditi Malhotra', 'Mumbai', '+91 90000 10259', 'Walk-in', 'regular', 4, 131000, 'Yesterday'],
  ['Kabir Singh', 'Gurgaon', '+91 90000 10296', 'Instagram', 'vip', 6, 288000, '25m ago'],
  ['Riya Bansal', 'Jaipur', '+91 90000 10333', 'Instagram', 'new', 0, 0, '40m ago'],
  ['Anita Desai', 'Mumbai', '+91 90000 10370', 'WhatsApp', 'regular', 2, 47000, '55m ago'],
  ['Naveen Kumar', 'Bengaluru', '+91 90000 10407', 'Website', 'new', 1, 62000, '1h ago'],
  ['Shreya Iyer', 'Chennai', '+91 90000 10444', 'WhatsApp', 'new', 0, 0, '1h ago'],
  ['Tarun Gupta', 'Delhi', '+91 90000 10481', 'Instagram', 'regular', 2, 39000, '2h ago'],
  ['Farah Khan', 'Mumbai', '+91 90000 10518', 'WhatsApp', 'follow_up', 1, 22000, '5h ago'],
];

export const MOCK_CUSTOMERS: Customer[] = rows.map(([name, city, phone, source, segment, orders, spent, lastContact], i) => ({
  id: `cu${i + 1}`, name, city, phone, source, segment, orders, spent, lastContact,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@example.com`,
  notes: segment === 'vip' ? ['Prefers calls after 6 PM.', 'Always pays by UPI.'] : segment === 'follow_up' ? ['Owner should reply personally.'] : [],
  activity: [
    { id: 'a1', text: `Chatted on ${source}`, time: lastContact },
    ...(orders > 0 ? [{ id: 'a2', text: `Placed order #ORD-${8900 + i}`, time: '2 weeks ago' }] : []),
    { id: 'a3', text: `First contact via ${source}`, time: orders > 3 ? '8 months ago' : '1 month ago' },
  ],
}));
