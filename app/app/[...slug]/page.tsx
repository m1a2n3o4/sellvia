import { Hammer } from 'lucide-react';
import { EmptyState } from '@/components/crm/empty-state';
import { PageHeader } from '@/components/crm/page-header';
import { findNavByPath } from '@/lib/crm/nav';

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

export default function PlannedScreen({ params }: { params: { slug: string[] } }) {
  const path = `/app/${params.slug.join('/')}`;
  const found = findNavByPath(path);
  const last = params.slug[params.slug.length - 1];
  const title = found?.title ?? (last === 'new' ? `New ${titleCase(params.slug[params.slug.length - 2] ?? 'item')}` : titleCase(last));
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon={Hammer} title="This screen is planned" description="It will be designed and built in a later stage of the CRM roadmap." />
    </>
  );
}
