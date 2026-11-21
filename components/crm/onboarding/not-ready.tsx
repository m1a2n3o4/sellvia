'use client';

import { Hammer } from 'lucide-react';
import { EmptyState } from '../empty-state';
import { PageHeader } from '../page-header';

/** A module that is configured for the owner's business but not built yet. Real owners never see sample data instead. */
export function NotReady({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon={Hammer} title="Coming soon" description={`${title} is part of your menu and is being built. We show nothing here rather than sample data, so what you see is always your own.`} />
    </>
  );
}
