import { ModulePage } from '@/components/crm/module-page';
import { OrdersView } from '@/components/crm/orders/orders-view';
import { getOrders } from '@/lib/crm/services/crm-data';

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <ModulePage module="orders" description="Orders from WhatsApp, Instagram and the website. Statuses follow this business's workflow.">
      <OrdersView orders={orders} />
    </ModulePage>
  );
}
