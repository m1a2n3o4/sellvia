'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LoginMode = 'pin' | 'otp';

export default function ClientLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('pin');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpLoading(true);

    try {
      const res = await fetch('/api/client/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        setOtpLoading(false);
        return;
      }

      setOtpSent(true);
      setCooldown(60);
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, string> = { mobile, mode };
      if (mode === 'pin') payload.pin = pin;
      if (mode === 'otp') payload.otp = otp;

      const res = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setTimeout(() => {
        if (data.pinChangeRequired) {
          router.push('/client/change-pin');
        } else {
          router.push('/client');
        }
        router.refresh();
      }, 100);
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SatyaSell</span>
          </div>
          <h1 className="text-lg font-semibold text-center mb-6 text-gray-300">
            Login to your account
          </h1>

          {/* Tabs */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode('pin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'pin'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login with PIN
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'otp'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login with OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-400 mb-1">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                required
              />
            </div>

            {mode === 'pin' && (
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">
                  6-Digit PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  required
                />
              </div>
            )}

            {mode === 'otp' && (
              <>
                <div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || cooldown > 0}
                    className="w-full py-2.5 px-4 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {otpLoading
                      ? 'Sending...'
                      : cooldown > 0
                      ? `Resend OTP in ${cooldown}s`
                      : otpSent
                      ? 'Resend OTP'
                      : 'Send OTP'}
                  </button>
                </div>

                {otpSent && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-400 mb-1">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'otp' && !otpSent)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Logging in...' : mode === 'pin' ? 'Login' : 'Verify & Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
