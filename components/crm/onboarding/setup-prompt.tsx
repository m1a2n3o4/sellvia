'use client';

import Link from 'next/link';
import { Sparkles, Store } from 'lucide-react';
import { btn } from '../button-styles';
import { PageHeader } from '../page-header';
import { useCrm } from '../crm-context';

/** Shown instead of a screen until the owner chooses their business (dashboard and every data page). */
export function SetupPrompt({ title, dashboard }: { title: string; dashboard?: boolean }) {
  const { user } = useCrm();
  return (
    <div className="mx-auto max-w-3xl">
      {!dashboard && <PageHeader title={title} />}
      <div className="crm-card flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-16">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-brand"><Sparkles className="h-7 w-7" aria-hidden /></span>
        {dashboard && <p className="t-micro mb-2 text-muted-foreground">Welcome to SatyaSell{user.name ? `, ${user.name.split(' ')[0]}` : ''}</p>}
        <h1 className="t-h2">What is your business?</h1>
        <p className="t-body-lg mt-2 max-w-md text-muted-foreground">Tell us what you sell or offer. We will set up your menu, product forms and fields to match, so you only see what you need.</p>
        <Link href="/app/onboarding" className={`${btn.brand} mt-7 !h-12 !px-8 !text-[15px]`}><Store className="h-5 w-5" aria-hidden />Choose your business</Link>
        <p className="t-small mt-4 text-muted-foreground">Takes about a minute. You can change it later.</p>
      </div>
    </div>
  );
}
