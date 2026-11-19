'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/lib/crm/mock/inbox';
import { InboxView } from './inbox-view';
import { InstagramLive } from './instagram-live';

/** Live Instagram DMs (real) and the demo conversations (simulated) side by side. */
export function InboxTabs({ threads }: { threads: Thread[] }) {
  const [tab, setTab] = useState<'live' | 'demo'>('live');
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5" role="tablist" aria-label="Inbox source">
        {([['live', 'Instagram (live)'], ['demo', 'Demo conversations (sample data)']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn('rounded-full px-4 py-1.5 text-[13px] font-semibold', tab === k ? 'bg-primary text-white' : 'bg-white/70 text-muted-foreground hover:text-ink')}>{l}</button>))}
      </div>
      {tab === 'live' ? <InstagramLive /> : <InboxView threads={threads} />}
    </div>
  );
}
