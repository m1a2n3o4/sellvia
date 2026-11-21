import { ProductForm } from '@/components/crm/catalogue/product-form';
import { ModulePage } from '@/components/crm/module-page';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <ModulePage module="products" description="Edit this product. Fields come from your business type.">
      <ProductForm productId={params.id} />
    </ModulePage>
  );
}
