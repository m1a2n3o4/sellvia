'use client';

import { useState } from 'react';
import { BarChart3, Bot, LayoutGrid, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '../../page-header';
import { LiveDot } from './live-dot';
import { WhatsAppOverview } from './overview';
import { WhatsAppLiveChats } from './live-chats';
import { WhatsAppReports } from './reports';
import { WhatsAppAiSettings } from './ai-settings';
import type { WaChat, WaData } from '@/lib/crm/mock/whatsapp';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'chats', label: 'Live chats', icon: MessageCircle },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'ai', label: 'AI settings', icon: Bot },
] as const;
type Tab = (typeof TABS)[number]['key'];

export function WhatsAppModule({ data }: { data: WaData }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [chats, setChats] = useState<WaChat[]>(data.chats);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const unread = chats.reduce((n, c) => n + c.unread, 0);

  const openChat = (id: string) => { setSelectedId(id); setTab('chats'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div>
      <PageHeader
        eyebrow={<><LiveDot /><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink">Simulated WhatsApp data</span></>}
        title="WhatsApp"
        description="Live customer chats, what your AI replied, and the full picture of your business, in one place."
      />
      <div className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/90 bg-white/70 p-1.5 shadow-[var(--shadow-rest)] backdrop-blur" role="tablist" aria-label="WhatsApp sections">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={cn('flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200', tab === t.key ? 'bg-primary text-white shadow-[0_8px_18px_-8px_rgba(11,12,17,0.6)]' : 'text-muted-foreground hover:bg-white hover:text-ink')}>
            <t.icon className={cn('h-4 w-4', tab === t.key && 'text-brand')} aria-hidden />{t.label}
            {t.key === 'chats' && unread > 0 && <span className="rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{unread}</span>}
          </button>
        ))}
      </div>
      <div key={tab} className="crm-page" role="tabpanel">
        {tab === 'overview' && <WhatsAppOverview data={data} onOpenChat={openChat} />}
        {tab === 'chats' && <WhatsAppLiveChats chats={chats} setChats={setChats} selectedId={selectedId} setSelectedId={setSelectedId} />}
        {tab === 'reports' && <WhatsAppReports data={data} />}
        {tab === 'ai' && <WhatsAppAiSettings data={data} />}
      </div>
    </div>
  );
}
