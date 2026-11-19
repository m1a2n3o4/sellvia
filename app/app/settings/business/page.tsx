import { PageHeader } from '@/components/crm/page-header';
import { BusinessSetup } from '@/components/crm/settings/business-setup';

export default function BusinessSetupPage() {
  return (
    <>
      <PageHeader title="Business setup" description="The templates active on this workspace and what they switch on: menu items, labels, forms and status workflows." />
      <BusinessSetup />
    </>
  );
}
