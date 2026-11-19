import { InboxTabs } from '@/components/crm/inbox/inbox-tabs';
import { ModulePage } from '@/components/crm/module-page';
import { getThreads } from '@/lib/crm/services/crm-data';

export default async function InboxPage() {
  const threads = await getThreads();
  return (
    <ModulePage module="inbox" reviewerDescription="Instagram messages sent to your connected account. You can reply within 24 hours of the customer's last message." description="WhatsApp and Instagram conversations in one place. Reply when the AI hands a customer over.">
      <InboxTabs threads={threads} />
    </ModulePage>
  );
}
