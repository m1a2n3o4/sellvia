'use client';

import { Globe } from 'lucide-react';
import { useCrm } from './crm-context';

/** Floating link to the client's public website. Opens in a new tab. */
export function WebsiteButton() {
  const { workspace } = useCrm();
  return (
    <a
      href={workspace.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View your website, ${workspace.name} (opens in a new tab)`}
      className="crm-glow group fixed bottom-24 right-4 z-40 flex h-14 items-center overflow-hidden rounded-full bg-gradient-to-br from-[#fff1a8] via-[#ffc300] to-[#ff9f1c] p-0 text-ink transition-transform duration-300 hover:scale-105 focus-visible:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center [perspective:300px]">
        <Globe className="crm-globe h-7 w-7" strokeWidth={2} aria-hidden />
      </span>
      <span className="max-w-0 whitespace-nowrap pr-0 text-sm font-bold opacity-0 transition-all duration-300 ease-out group-hover:max-w-[10rem] group-hover:pr-5 group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:pr-5 group-focus-visible:opacity-100">
        View website
      </span>
    </a>
  );
}
