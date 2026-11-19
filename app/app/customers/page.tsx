import { CustomersView } from '@/components/crm/customers/customers-view';
import { ModulePage } from '@/components/crm/module-page';
import { getCustomers } from '@/lib/crm/services/crm-data';

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <ModulePage module="customers" description="Everyone who has contacted or bought from the business, across WhatsApp, Instagram and the website.">
      <CustomersView customers={customers} />
    </ModulePage>
  );
}
