'use client';

import { useMemo, useState } from 'react';
import { Bot, Lock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../../button-styles';
import type { WaData } from '@/lib/crm/mock/whatsapp';

const MAX_DESC = 400, MAX_CUSTOM = 800;

// Guardrails we recommend. `locked` rules are always enforced and cannot be switched off.
const BOUNDARIES = [
  { key: 'catalogue', locked: true, title: 'Answer only from my products and business info', body: 'Never invent prices, stock, offers or delivery promises.' },
  { key: 'privacy', locked: true, title: 'Never share one customer\'s details with another', body: 'No names, numbers, addresses or order details of other people.' },
  { key: 'payments', locked: true, title: 'Never ask for card numbers, UPI PIN or OTP in chat', body: 'Payments go only through secure payment links.' },
  { key: 'handoffComplaint', locked: false, title: 'Hand complaints and angry customers to me', body: 'AI apologises once, flags it as urgent and stops arguing.' },
  { key: 'handoffHuman', locked: false, title: 'Hand over when a customer asks for a person', body: 'AI confirms I will contact them and adds them to "Want to talk to you".' },
  { key: 'offTopic', locked: false, title: 'Politely decline unrelated topics', body: 'Keeps the chat on your business, not general questions or spam.' },
  { key: 'noGuarantees', locked: false, title: 'No guarantees on delivery dates, gold rates or returns', body: 'AI quotes only what is in my written policy.' },
  { key: 'afterHours', locked: false, title: 'Outside working hours, say I will reply in the morning', body: 'Still takes orders through links; complex questions wait for me.' },
] as const;

function Switch({ on, set, label, locked }: { on: boolean; set?: (v: boolean) => void; label: string; locked?: boolean }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} disabled={locked} onClick={() => set?.(!on)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', on ? 'bg-primary' : 'bg-[#c3c9db]', locked && 'opacity-60')}>
      <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', on && 'translate-x-5')} />
    </button>
  );
}

export function WhatsAppAiSettings({ data }: { data: WaData }) {
  const s0 = data.settings;
  const [storeName, setStoreName] = useState(s0.storeName);
  const [allowLocation, setAllowLocation] = useState(s0.allowLocation);
  const [address, setAddress] = useState(s0.address);
  const [allowPhone, setAllowPhone] = useState(s0.allowPhone);
  const [phone, setPhone] = useState(s0.phone);
  const [description, setDescription] = useState(s0.description);
  const [maxDiscount, setMaxDiscount] = useState(String(s0.maxDiscount));
  const [custom, setCustom] = useState(s0.custom);
  const [rules, setRules] = useState<Record<string, boolean>>(() => Object.fromEntries(BOUNDARIES.map((b) => [b.key, true])));
  const [saved, setSaved] = useState('');

  const errors = useMemo(() => ({
    storeName: storeName.trim() ? '' : 'Enter your store name.',
    address: allowLocation && !address.trim() ? 'Add the address AI may share, or turn this off.' : '',
    phone: allowPhone && !/^[+\d][\d\s-]{7,}$/.test(phone.trim()) ? 'Enter a valid phone number, or turn this off.' : '',
    discount: /^\d{1,2}$/.test(maxDiscount) || maxDiscount === '100' ? '' : 'Enter a whole number from 0 to 100.',
  }), [storeName, allowLocation, address, allowPhone, phone, maxDiscount]);
  const valid = !Object.values(errors).some(Boolean);

  const asked = (what: string) => `Customer: ${what}`;
  const locationReply = allowLocation ? `You can visit us at ${address || '(add your address)'}.` : `I can't share the address here, but the owner can send it to you personally.`;
  const phoneReply = allowPhone ? `You can call us on ${phone || '(add your number)'}.` : `I can't share a phone number here. The owner will contact you on WhatsApp.`;

  const field = 'mt-1.5 w-full rounded-2xl border border-white/90 bg-white/90 px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,12,17,0.12)]';
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="space-y-6 xl:col-span-3">
        <section className="crm-card p-5 sm:p-6">
          <h2 className="t-h3">About your store</h2>
          <p className="t-small text-muted-foreground">What the AI tells customers about you.</p>
          <label htmlFor="storeName" className="t-label mt-4 block">Store name</label>
          <input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={cn(field, 'h-11')} />
          {errors.storeName && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.storeName}</p>}
          <div className="mt-4 flex items-baseline justify-between"><label htmlFor="desc" className="t-label">Short description sent to customers</label><span className="num text-xs text-muted-foreground">{description.length}/{MAX_DESC}</span></div>
          <textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))} className={cn(field, 'py-3')} />
        </section>

        <section className="crm-card p-5 sm:p-6">
          <h2 className="t-h3">What AI may share, only if asked</h2>
          <ul className="mt-3 divide-y divide-black/5">
            <li className="py-4">
              <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><MapPin className="h-4 w-4 text-brand" aria-hidden /></span><div><p className="text-sm font-bold text-ink">Share store location</p><p className="t-small text-muted-foreground">Only when a customer asks where you are.</p></div></div><Switch on={allowLocation} set={setAllowLocation} label="Share store location if asked" /></div>
              {allowLocation && <><label htmlFor="addr" className="sr-only">Address</label><input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className={cn(field, 'h-11')} />{errors.address && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.address}</p>}</>}
            </li>
            <li className="py-4">
              <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><Phone className="h-4 w-4 text-brand" aria-hidden /></span><div><p className="text-sm font-bold text-ink">Share phone number</p><p className="t-small text-muted-foreground">Only when a customer asks to call you.</p></div></div><Switch on={allowPhone} set={setAllowPhone} label="Share phone number if asked" /></div>
              {allowPhone && <><label htmlFor="ph" className="sr-only">Phone number</label><input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" inputMode="tel" className={cn(field, 'h-11')} />{errors.phone && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.phone}</p>}</>}
            </li>
          </ul>
        </section>

        <section className="crm-card p-5 sm:p-6" aria-labelledby="bound-title">
          <h2 id="bound-title" className="t-h3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand" aria-hidden />Boundaries for your AI</h2>
          <p className="t-small text-muted-foreground">Recommended safety rules. Locked rules are always on to protect you and your customers.</p>
          <ul className="mt-3 divide-y divide-black/5">
            {BOUNDARIES.map((b) => (
              <li key={b.key} className="flex items-start justify-between gap-4 py-3.5">
                <div><p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">{b.title}{b.locked && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground"><Lock className="h-3 w-3" aria-hidden />Always on</span>}</p><p className="t-small text-muted-foreground">{b.body}</p></div>
                <Switch on={rules[b.key]} set={(v) => setRules((r) => ({ ...r, [b.key]: v }))} label={b.title} locked={b.locked} />
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-4 sm:grid-cols-[12rem_1fr]">
            <div><label htmlFor="disc" className="t-label block">Max discount AI may offer (%)</label><input id="disc" inputMode="numeric" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value.replace(/\D/g, '').slice(0, 3))} className={cn(field, 'h-11')} />{errors.discount ? <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.discount}</p> : <p className="t-small mt-1 text-muted-foreground">0 means AI never offers a discount.</p>}</div>
            <div><div className="flex items-baseline justify-between"><label htmlFor="custom" className="t-label">Your own instructions for the AI</label><span className="num text-xs text-muted-foreground">{custom.length}/{MAX_CUSTOM}</span></div><textarea id="custom" rows={3} value={custom} onChange={(e) => setCustom(e.target.value.slice(0, MAX_CUSTOM))} className={cn(field, 'py-3')} /></div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setSaved(valid ? 'Saved on this screen only (simulated). It will apply to your real AI once the backend is connected.' : 'Fix the highlighted fields first.')} className={btn.navy}>Save AI settings</button>
          {saved && <p role="status" className="rounded-full bg-brand/20 px-4 py-2 text-xs font-semibold text-ink">{saved}</p>}
        </div>
      </div>

      {/* Live preview */}
      <aside className="xl:col-span-2" aria-label="Preview">
        <div className="sticky top-24 space-y-3">
          <p className="t-micro text-muted-foreground">Preview: how your AI will answer</p>
          <div className="crm-card space-y-3 p-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-brand">{storeName.charAt(0) || 'S'}</span><div><p className="text-sm font-bold text-ink">{storeName || 'Your store'}</p><p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Bot className="h-3 w-3" aria-hidden />SatyaSell AI</p></div></div>
            <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-2.5 text-sm text-white ml-auto">Hi! Welcome to {storeName || 'our store'}. {description}</p>
            <p className="max-w-[85%] rounded-[20px] rounded-bl-md bg-white px-4 py-2.5 text-sm">{asked('Where are you located?')}</p>
            <p className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">{locationReply}</p>
            <p className="max-w-[85%] rounded-[20px] rounded-bl-md bg-white px-4 py-2.5 text-sm">{asked('Can I call you?')}</p>
            <p className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">{phoneReply}</p>
            <p className="max-w-[85%] rounded-[20px] rounded-bl-md bg-white px-4 py-2.5 text-sm">{asked('Can you give me 30% off?')}</p>
            <p className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">{Number(maxDiscount) > 0 ? `I can offer up to ${maxDiscount}% off on eligible items.` : 'I can\'t offer discounts myself, but I\'ve asked the owner to look at your request.'}</p>
          </div>
          <p className="px-2 text-xs text-muted-foreground">Sample replies built from your settings. Real replies come from your live AI once connected.</p>
        </div>
      </aside>
    </div>
  );
}
