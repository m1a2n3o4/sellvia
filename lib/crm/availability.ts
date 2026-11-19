// SIMULATION of date-based room availability. The real version is a backend booking service
// with transactions. Rooms held = bookings that are Confirmed or Checked In. Nights are [checkIn, checkOut).
import type { Booking, RoomType } from './mock/hospitality';

const HOLDING = ['confirmed', 'checked_in'];
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86400000;
export const addDays = (iso: string, n: number) => new Date((day(iso) + n) * 86400000).toISOString().slice(0, 10);
export const nights = (a: string, b: string) => Math.max(0, day(b) - day(a));
export const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Units of a room type still free on one night. */
export function unitsFree(rt: RoomType, bookings: Booking[], night: string, ignoreId?: string): number {
  const held = bookings.filter((b) => b.roomTypeId === rt.id && b.id !== ignoreId && HOLDING.includes(b.status) && day(b.checkIn) <= day(night) && day(night) < day(b.checkOut))
    .reduce((a, b) => a + b.rooms, 0);
  return Math.max(0, rt.units - held);
}

/** Null when the stay can be held, otherwise the reason it cannot. */
export function confirmBlocker(b: Booking, rt: RoomType, all: Booking[]): string | null {
  for (let d = b.checkIn; day(d) < day(b.checkOut); d = addDays(d, 1)) {
    const free = unitsFree(rt, all, d, b.id);
    if (free < b.rooms) return `Not enough ${rt.name} rooms on ${fmt(d)}: ${free} free, ${b.rooms} needed. The booking service would refuse this.`;
  }
  return null;
}
