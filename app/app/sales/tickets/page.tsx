import { TicketsView } from '@/components/crm/events/tickets-view';
import { ModulePage } from '@/components/crm/module-page';
import { getEvents, getTicketBookings } from '@/lib/crm/services/crm-data';

export default async function TicketsPage() {
  const [tickets, events] = await Promise.all([getTicketBookings(), getEvents()]);
  return (
    <ModulePage module="tickets" description="Ticket orders for your events. Check guests in on the day.">
      <TicketsView tickets={tickets} events={events} />
    </ModulePage>
  );
}
