// SIMULATED events, ticket categories and ticket bookings.
export interface TicketType { id: string; name: string; price: number; capacity: number; sold: number; salesEnd: string; maxPerOrder: number }
export interface EventItem { id: string; name: string; venue: string; start: string; end: string; status: 'upcoming' | 'past' | 'draft'; tickets: TicketType[] }
export interface TicketBooking { id: string; eventId: string; buyer: string; ticketTypeId: string; qty: number; amount: number; status: string }

export const MOCK_EVENTS: EventItem[] = [
  { id: 'ev1', name: 'Sunset Music Festival', venue: 'Palm Valley Lawns', start: '2026-12-12', end: '2026-12-13', status: 'upcoming', tickets: [
    { id: 't1', name: 'Early Bird', price: 799, capacity: 150, sold: 150, salesEnd: '2026-11-15', maxPerOrder: 6 },
    { id: 't2', name: 'General', price: 1499, capacity: 600, sold: 318, salesEnd: '2026-12-11', maxPerOrder: 8 },
    { id: 't3', name: 'VIP', price: 4999, capacity: 80, sold: 61, salesEnd: '2026-12-10', maxPerOrder: 4 },
  ] },
  { id: 'ev2', name: 'Wedding Showcase Expo', venue: 'Grand Hall, Hyderabad', start: '2027-01-18', end: '2027-01-18', status: 'upcoming', tickets: [
    { id: 't4', name: 'General', price: 299, capacity: 400, sold: 74, salesEnd: '2027-01-17', maxPerOrder: 10 },
    { id: 't5', name: 'Student', price: 149, capacity: 100, sold: 22, salesEnd: '2027-01-17', maxPerOrder: 2 },
  ] },
  { id: 'ev3', name: 'Diwali Dandiya Night', venue: 'Palm Valley Lawns', start: '2026-11-08', end: '2026-11-08', status: 'past', tickets: [
    { id: 't6', name: 'General', price: 999, capacity: 500, sold: 482, salesEnd: '2026-11-07', maxPerOrder: 8 },
  ] },
];

export const MOCK_TICKET_BOOKINGS: TicketBooking[] = [
  { id: 'TK-7001', eventId: 'ev1', buyer: 'Arjun Reddy', ticketTypeId: 't2', qty: 4, amount: 5996, status: 'confirmed' },
  { id: 'TK-7002', eventId: 'ev1', buyer: 'Sneha Pillai', ticketTypeId: 't3', qty: 2, amount: 9998, status: 'confirmed' },
  { id: 'TK-7003', eventId: 'ev1', buyer: 'Rahul Bose', ticketTypeId: 't2', qty: 2, amount: 2998, status: 'pending' },
  { id: 'TK-7004', eventId: 'ev2', buyer: 'Meghana R.', ticketTypeId: 't4', qty: 3, amount: 897, status: 'confirmed' },
  { id: 'TK-7005', eventId: 'ev2', buyer: 'Karthik N.', ticketTypeId: 't5', qty: 1, amount: 149, status: 'pending' },
  { id: 'TK-7006', eventId: 'ev3', buyer: 'Divya Shah', ticketTypeId: 't6', qty: 5, amount: 4995, status: 'checked_in' },
  { id: 'TK-7007', eventId: 'ev3', buyer: 'Nikhil Jain', ticketTypeId: 't6', qty: 2, amount: 1998, status: 'refunded' },
  { id: 'TK-7008', eventId: 'ev1', buyer: 'Tara Menon', ticketTypeId: 't2', qty: 1, amount: 1499, status: 'cancelled' },
];
