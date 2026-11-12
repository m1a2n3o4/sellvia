'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export function DemoForm() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    instagramLink: '',
    website: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setForm({ name: '', mobile: '', instagramLink: '', website: '', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-gray-400">We&apos;ll contact you within 24 hours to set up your demo.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-violet-400 hover:text-violet-300 text-sm font-medium underline underline-offset-4"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Your Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-white bg-gray-800/50 placeholder-gray-500 transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Mobile Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          name="mobile"
          required
          pattern="\d{10}"
          maxLength={10}
          value={form.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          className="w-full px-4 py-3 border border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-white bg-gray-800/50 placeholder-gray-500 transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Instagram Page Link
        </label>
        <input
          type="url"
          name="instagramLink"
          value={form.instagramLink}
          onChange={handleChange}
          placeholder="https://instagram.com/yourpage"
          className="w-full px-4 py-3 border border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-white bg-gray-800/50 placeholder-gray-500 transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Website (if any)
        </label>
        <input
          type="url"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 border border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-white bg-gray-800/50 placeholder-gray-500 transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Anything you want to tell us?
        </label>
        <textarea
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          placeholder="Questions, ideas, or just say hi..."
          className="w-full px-4 py-3 border border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-white bg-gray-800/50 placeholder-gray-500 resize-none transition-all text-sm"
        />
      </div>

      {status === 'error' && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-3.5 px-6 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-sm shadow-violet-500/20"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Book My Free Demo
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to be contacted about SatyaSell and accept our{' '}
        <a href="/privacy-policy" className="text-violet-400 hover:underline">Privacy Policy</a> and{' '}
        <a href="/terms" className="text-violet-400 hover:underline">Terms</a>.
      </p>
    </form>
  );
}
