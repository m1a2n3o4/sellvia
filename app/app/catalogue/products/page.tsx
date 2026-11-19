import { AddProductLink, ProductsView } from '@/components/crm/catalogue/products-view';
import { ModulePage } from '@/components/crm/module-page';
import { getProducts } from '@/lib/crm/services/crm-data';

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <ModulePage module="products" description="Your catalogue and live stock. Products imported from Instagram appear here as drafts to review." actions={<AddProductLink />}>
      <ProductsView products={products} />
    </ModulePage>
  );
}
