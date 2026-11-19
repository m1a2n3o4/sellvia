import { ModulePage } from '@/components/crm/module-page';
import { RoomsView } from '@/components/crm/hospitality/rooms-view';
import { getBookings, getRoomTypes } from '@/lib/crm/services/crm-data';

export default async function RoomsPage() {
  const [rooms, bookings] = await Promise.all([getRoomTypes(), getBookings()]);
  return (
    <ModulePage module="packages" description="Room types, prices and which rooms are free on each night.">
      <RoomsView rooms={rooms} bookings={bookings} />
    </ModulePage>
  );
}
