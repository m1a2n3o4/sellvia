import { EventsView } from '@/components/crm/events/events-view';
import { ModulePage } from '@/components/crm/module-page';
import { getEvents } from '@/lib/crm/services/crm-data';

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <ModulePage module="events" description="Your events, ticket categories and how many are sold.">
      <EventsView events={events} />
    </ModulePage>
  );
}
