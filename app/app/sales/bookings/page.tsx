import { BookingsView } from '@/components/crm/hospitality/bookings-view';
import { ModulePage } from '@/components/crm/module-page';
import { getBookings, getRoomTypes } from '@/lib/crm/services/crm-data';

export default async function BookingsPage() {
  const [bookings, rooms] = await Promise.all([getBookings(), getRoomTypes()]);
  return (
    <ModulePage module="bookings" description="Stays from WhatsApp, Instagram and the website. A booking can only be confirmed if rooms are free for every night.">
      <BookingsView bookings={bookings} rooms={rooms} />
    </ModulePage>
  );
}
