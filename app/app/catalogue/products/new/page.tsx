import { ProductForm } from '@/components/crm/catalogue/product-form';
import { ModulePage } from '@/components/crm/module-page';

export default function NewProductPage() {
  return (
    <ModulePage module="add-product" description="The form is built from the fields defined by this business's template.">
      <ProductForm />
    </ModulePage>
  );
}
