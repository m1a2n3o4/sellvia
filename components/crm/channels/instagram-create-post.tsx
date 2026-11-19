'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, ImagePlus, MessageSquareReply, Send, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from '../button-styles';
import { PageHeader } from '../page-header';

const MAX = 2200;
const PRODUCTS = ['Royal Polki Choker Set 22k', 'Bridal Kundan Jhumkas', 'Temple Kada Bangles', 'Solitaire Everyday Ring', 'Heritage Silver Pooja Set'];
const SETTINGS = [
  { key: 'autoReply', icon: MessageSquareReply, title: 'Allow Instagram auto-reply', body: 'AI replies to relevant comments on this post.' },
  { key: 'sendLink', icon: ShoppingBag, title: 'Send product link in DM', body: 'Commenters get a private DM with the order link.' },
  { key: 'waAi', icon: Bot, title: 'Allow WhatsApp AI to take orders and reply', body: 'When they tap the WhatsApp link, AI handles the order chat.' },
] as const;

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', on ? 'bg-navy' : 'bg-[#cbd5e1]')}>
      <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', on && 'translate-x-5')} />
    </button>
  );
}

export function InstagramCreatePost() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [product, setProduct] = useState('');
  const [opts, setOpts] = useState<Record<string, boolean>>({ autoReply: true, sendLink: true, waAi: true });
  const [errors, setErrors] = useState<{ image?: string; caption?: string }>({});
  const [result, setResult] = useState('');

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setErrors((e) => ({ ...e, image: 'Please choose an image file (JPG or PNG).' })); return; }
    if (f.size > 8 * 1024 * 1024) { setErrors((e) => ({ ...e, image: 'Image is larger than 8 MB.' })); return; }
    setErrors((e) => ({ ...e, image: undefined })); setFile(f);
  };

  const submit = () => {
    const next = { image: file ? undefined : 'Add a photo to post.', caption: caption.trim() ? undefined : 'Write a caption for your post.' };
    setErrors(next); setResult('');
    if (next.image || next.caption) return;
    setResult('Simulated: nothing was published. After Instagram is connected, this publishes through Meta and applies the settings you chose.');
  };

  return (
    <div>
      <Link href="/app/channels/instagram" className="mb-3 inline-flex items-center gap-1 text-[13px] font-semibold text-navy hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden />Back to Instagram</Link>
      <PageHeader title="Create a post" description="Upload a photo, write the caption, link a product and choose how SatyaSell handles replies and orders." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <section className="crm-card p-5">
            <h2 className="t-h3">Photo</h2>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Upload photo" onChange={(e) => pick(e.target.files?.[0])} />
            {preview ? (
              <div className="relative mt-3 overflow-hidden rounded-2xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Selected post" className="mx-auto max-h-80 object-contain" />
                <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow" aria-label="Remove photo"><X className="h-4 w-4" aria-hidden /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
                className="mt-3 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/50 px-6 py-12 text-center transition-colors hover:border-navy/40 hover:bg-secondary">
                <ImagePlus className="h-8 w-8 text-brand" aria-hidden />
                <span className="mt-2 text-sm font-semibold text-navy">Click to upload or drag a photo here</span>
                <span className="text-xs text-muted-foreground">JPG or PNG, up to 8 MB</span>
              </button>
            )}
            {errors.image && <p role="alert" className="mt-2 text-xs font-medium text-danger">{errors.image}</p>}
          </section>

          <section className="crm-card p-5">
            <div className="flex items-baseline justify-between"><h2 className="t-h3"><label htmlFor="caption">Caption</label></h2><span className={cn('num text-xs', caption.length > MAX ? 'text-danger' : 'text-muted-foreground')}>{caption.length}/{MAX}</span></div>
            <textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value.slice(0, MAX))} rows={5} placeholder="Write something that makes people comment “price”…"
              className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:border-navy" />
            {errors.caption && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.caption}</p>}
            <label htmlFor="product" className="t-label mt-4 block text-ink">Link a product (optional)</label>
            <select id="product" value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1.5 h-10 w-full rounded-2xl border border-border bg-white px-3 text-sm focus:outline-none focus-visible:border-navy">
              <option value="">No product linked</option>{PRODUCTS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <p className="t-small mt-1 text-muted-foreground">Linked products get order tracking and inventory sync for this post.</p>
          </section>

          <section className="crm-card p-5">
            <h2 className="t-h3">Automation settings</h2>
            <ul className="mt-3 divide-y divide-muted">
              {SETTINGS.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-start gap-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-secondary"><s.icon className="h-4 w-4 text-brand" aria-hidden /></span>
                    <div><p className="text-sm font-semibold text-ink">{s.title}</p><p className="t-small text-muted-foreground">{s.body}</p></div></div>
                  <Switch on={opts[s.key]} onChange={(v) => setOpts((o) => ({ ...o, [s.key]: v }))} label={s.title} />
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={submit} className={btn.brand}><Send className="h-4 w-4" aria-hidden />Post to Instagram</button>
            <Link href="/app/channels/instagram" className={btn.outline}>Cancel</Link>
          </div>
          {result && <p role="status" className="rounded-2xl bg-brand/15 px-3 py-2 text-sm text-ink">{result}</p>}
        </div>

        {/* Live preview */}
        <aside className="lg:col-span-2" aria-label="Post preview">
          <div className="sticky top-24">
            <p className="t-micro mb-2 text-muted-foreground">Preview</p>
            <div className="crm-card overflow-hidden">
              <div className="flex items-center gap-2 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-brand">A</span><span className="text-sm font-semibold">aurajewels_mumbai</span></div>
              <div className="flex aspect-square items-center justify-center bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-10 w-10 text-[#cbd5e1]" aria-hidden />}
              </div>
              <div className="space-y-1 p-3 text-sm">
                <p className="whitespace-pre-wrap break-words"><span className="font-semibold">aurajewels_mumbai</span> {caption || <span className="text-muted-foreground">Your caption appears here.</span>}</p>
                {product && <p className="text-xs text-muted-foreground">Linked: {product}</p>}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
