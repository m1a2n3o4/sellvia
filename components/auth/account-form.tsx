'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { btn } from '@/components/crm/button-styles';
import { inputCls } from '@/components/crm/dynamic/dynamic-field';

export function AccountForm({ mode }: { mode: 'register' | 'signin' }) {
  const reg = mode === 'register';
  const [name, setName] = useState(''); const [mobile, setMobile] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    const digits = mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (reg && name.trim().length < 2) return setErr('Please enter your name');
    if (!/^[6-9]\d{9}$/.test(digits)) return setErr('Enter a valid 10-digit mobile number');
    if (password.length < 5) return setErr('Password must be at least 5 characters');
    setBusy(true);
    try {
      const r = await fetch(reg ? '/api/auth/register' : '/api/auth/signin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, mobile: digits, password }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error ?? 'Something went wrong'); setBusy(false); return; }
      window.location.assign('/app');
    } catch { setErr('Could not reach the server. Please try again.'); setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="crm-card w-full max-w-md p-7 sm:p-9">
      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-brand">S</span>
      <h1 className="t-h2">{reg ? 'Create your account' : 'Welcome back'}</h1>
      <p className="t-body mt-1 text-muted-foreground">{reg ? 'Register with your mobile number to set up your business on SatyaSell.' : 'Sign in with your mobile number and password.'}</p>
      <div className="mt-6 space-y-4">
        {reg && <div><label htmlFor="ac-name" className="t-label mb-1.5 block">Your name</label><input id="ac-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>}
        <div><label htmlFor="ac-mobile" className="t-label mb-1.5 block">Mobile number</label><input id="ac-mobile" inputMode="numeric" className={inputCls} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit number" autoComplete="tel-national" /></div>
        <div><label htmlFor="ac-pw" className="t-label mb-1.5 block">Password</label>
          <div className="relative"><input id="ac-pw" type={show ? 'text' : 'password'} className={`${inputCls} pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={reg ? 'new-password' : 'current-password'} />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          {reg && <p className="t-small mt-1 text-muted-foreground">At least 5 characters.</p>}</div>
      </div>
      {err && <p role="alert" className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{err}</p>}
      <button type="submit" disabled={busy} className={`${btn.brand} mt-6 !h-12 w-full !text-[15px]`}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
      <p className="t-body mt-5 text-center text-muted-foreground">{reg ? <>Already registered? <Link href="/signin" className="font-semibold text-ink underline">Sign in</Link></> : <>New here? <Link href="/register" className="font-semibold text-ink underline">Create an account</Link></>}</p>
    </form>
  );
}
