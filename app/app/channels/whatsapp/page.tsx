import { WhatsAppModule } from '@/components/crm/channels/whatsapp/whatsapp-module';
import { getWhatsApp } from '@/lib/crm/services/insights';

export default async function WhatsAppPage() {
  const data = await getWhatsApp();
  return <WhatsAppModule data={data} />;
}
