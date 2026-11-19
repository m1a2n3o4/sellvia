// SIMULATED rooms and bookings. Availability here is date-based and computed from bookings,
// never a stock number. Real allocation and double-booking prevention belong to the booking service.
export const MOCK_TODAY = '2026-11-19'; // fixed "today" so the demo is stable

export interface RoomType { id: string; name: string; type: string; maxGuests: number; units: number; basePrice: number; weekendPrice: number; amenities: string[] }
export interface Booking {
  id: string; guest: string; roomTypeId: string; checkIn: string; checkOut: string; guests: number; rooms: number;
  amount: number; paid: boolean; status: string;
}

export const MOCK_ROOM_TYPES: RoomType[] = [
  { id: 'rt-std', name: 'Garden Standard', type: 'Standard', maxGuests: 2, units: 8, basePrice: 3800, weekendPrice: 4500, amenities: ['Wi-Fi', 'AC', 'Breakfast'] },
  { id: 'rt-dlx', name: 'Palm Deluxe', type: 'Deluxe', maxGuests: 3, units: 6, basePrice: 5600, weekendPrice: 6800, amenities: ['Wi-Fi', 'AC', 'Pool view', 'Breakfast'] },
  { id: 'rt-ste', name: 'Valley Suite', type: 'Suite', maxGuests: 4, units: 3, basePrice: 9800, weekendPrice: 11500, amenities: ['Wi-Fi', 'AC', 'Pool view', 'Balcony', 'Breakfast'] },
  { id: 'rt-vil', name: 'Private Villa', type: 'Villa', maxGuests: 6, units: 2, basePrice: 18500, weekendPrice: 21000, amenities: ['Wi-Fi', 'AC', 'Pool view', 'Balcony', 'Breakfast'] },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK-3101', guest: 'Ananya Rao', roomTypeId: 'rt-vil', checkIn: '2026-11-21', checkOut: '2026-11-24', guests: 4, rooms: 1, amount: 55500, paid: true, status: 'confirmed' },
  { id: 'BK-3102', guest: 'Rohit Verma', roomTypeId: 'rt-vil', checkIn: '2026-11-22', checkOut: '2026-11-25', guests: 5, rooms: 1, amount: 55500, paid: true, status: 'confirmed' },
  { id: 'BK-3103', guest: 'Kavya Menon', roomTypeId: 'rt-vil', checkIn: '2026-11-22', checkOut: '2026-11-23', guests: 2, rooms: 1, amount: 21000, paid: false, status: 'pending' },
  { id: 'BK-3104', guest: 'Sanjay Kulkarni', roomTypeId: 'rt-dlx', checkIn: '2026-11-19', checkOut: '2026-11-21', guests: 3, rooms: 2, amount: 12400, paid: true, status: 'checked_in' },
  { id: 'BK-3105', guest: 'Priya Nair', roomTypeId: 'rt-ste', checkIn: '2026-11-23', checkOut: '2026-11-26', guests: 2, rooms: 1, amount: 29400, paid: true, status: 'confirmed' },
  { id: 'BK-3106', guest: 'Imran Sheikh', roomTypeId: 'rt-std', checkIn: '2026-11-20', checkOut: '2026-11-22', guests: 2, rooms: 3, amount: 25200, paid: false, status: 'pending' },
  { id: 'BK-3107', guest: 'Deepa Shah', roomTypeId: 'rt-dlx', checkIn: '2026-11-15', checkOut: '2026-11-18', guests: 2, rooms: 1, amount: 16800, paid: true, status: 'checked_out' },
  { id: 'BK-3108', guest: 'Vivek Anand', roomTypeId: 'rt-std', checkIn: '2026-11-28', checkOut: '2026-11-30', guests: 2, rooms: 1, amount: 7600, paid: true, status: 'cancelled' },
];
