'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCrm } from '../crm-context';
import { InstagramConnect } from './instagram-connect';
import { InstagramRealCard, type RealStatus } from './instagram-real-card';
import { btn } from '../button-styles';
import { InstagramConnected } from './instagram-connected';
import type { IgPost, MOCK_IG } from '@/lib/crm/mock/instagram';

/** Chooses between the "connect" page and the connected dashboard. Simulated until the backend exists. */
export function InstagramEntry({ profile, posts }: { profile: typeof MOCK_IG; posts: IgPost[] }) {
  const { workspace, simulated, reviewer: isReviewer } = useCrm();
  const reviewer = isReviewer || !!workspace.real; // real owners, like reviewers, never see the sample dashboard
  const [override, setOverride] = useState<{ ws: string; connected: boolean } | null>(null);
  const connected = override && override.ws === workspace.id ? override.connected : workspace.instagramConnected;
  const set = (v: boolean) => setOverride({ ws: workspace.id, connected: v });
  // Real state of the logged-in business. null = not logged in (local preview), then the sample pages below are all we have.
  const [real, setReal] = useState<RealStatus | null | undefined>(undefined);
  const [showSample, setShowSample] = useState(false);
  const loggedIn = !!real;

  return (
    <div className="space-y-6">
      <InstagramRealCard onState={setReal} />
      {loggedIn && !showSample ? (reviewer ? null : (
        <div className="text-center">
          <button onClick={() => setShowSample(true)} className={btn.ghost}>See a sample of the connected dashboard</button>
          <p className="t-small text-muted-foreground">Sample data only. Comment tracking, product import and order attribution are not live yet.</p>
        </div>
      )) : (
    <div>
      {loggedIn && <p className="mb-4 rounded-2xl bg-brand/15 px-4 py-2 text-xs text-ink">Sample preview with invented data. Nothing below is from your account.</p>}
      {simulated && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-full border border-dashed border-[#c3c9db] bg-white/70 px-4 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-ink">Preview state</span>
          <div className="inline-flex rounded-full bg-secondary p-0.5 font-semibold" role="group" aria-label="Preview state">
            {([[false, 'Not connected'], [true, 'Connected']] as const).map(([v, label]) => (
              <button key={label} aria-pressed={connected === v} onClick={() => set(v)}
                className={cn('rounded-full px-2.5 py-1 transition-all', connected === v ? 'bg-white text-navy shadow-sm' : 'hover:text-navy')}>{label}</button>
            ))}
          </div>
          <span>Shows both versions of this page. Real state comes from the backend later.</span>
        </div>
      )}
      {connected ? <InstagramConnected profile={profile} posts={posts} /> : <InstagramConnect onSimulateConnect={() => set(true)} />}
    </div>
      )}
    </div>
  );
}
