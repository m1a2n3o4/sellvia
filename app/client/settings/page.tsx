'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle, ChevronDown, ChevronRight, Unplug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessInfoData {
  id?: string;
  storeName: string;
  description: string;
  storeHours: string;
  location: string;
  locationUrl: string;
  policies: string;
  greeting: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessId: string;
  whatsappToken: string;
  whatsappAppSecret: string;
  openaiKey: string;
  aiEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  paymentGateway: string;
  ownerPhone: string;
  shareOwnerPhone: boolean;
  aiCustomInstructions: string;
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
        params: { config_id: string; response_type: string; override_default_response_type: boolean; extras: { setup: Record<string, unknown>; featureType: string; sessionInfoVersion: number } }
      ) => void;
    };
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectedPhone, setConnectedPhone] = useState('');
  const [showManualSetup, setShowManualSetup] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const [form, setForm] = useState<BusinessInfoData>({
    storeName: '',
    description: '',
    storeHours: '',
    location: '',
    locationUrl: '',
    policies: '',
    greeting: '',
    whatsappPhoneNumberId: '',
    whatsappBusinessId: '',
    whatsappToken: '',
    whatsappAppSecret: '',
    openaiKey: '',
    aiEnabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    cashfreeAppId: '',
    cashfreeSecretKey: '',
    paymentGateway: 'none',
    ownerPhone: '',
    shareOwnerPhone: false,
    aiCustomInstructions: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/client/business-info');
        if (res.ok) {
          const data = await res.json();
          setForm({
            storeName: data.storeName || '',
            description: data.description || '',
            storeHours: data.storeHours || '',
            location: data.location || '',
            locationUrl: data.locationUrl || '',
            policies: data.policies || '',
            greeting: data.greeting || '',
            whatsappPhoneNumberId: data.whatsappPhoneNumberId || '',
            whatsappBusinessId: data.whatsappBusinessId || '',
            whatsappToken: data.whatsappToken || '',
            whatsappAppSecret: data.whatsappAppSecret || '',
            openaiKey: data.openaiKey || '',
            aiEnabled: data.aiEnabled ?? true,
            razorpayKeyId: data.razorpayKeyId || '',
            razorpayKeySecret: data.razorpayKeySecret || '',
            cashfreeAppId: data.cashfreeAppId || '',
            cashfreeSecretKey: data.cashfreeSecretKey || '',
            paymentGateway: data.paymentGateway || 'none',
            ownerPhone: data.ownerPhone || '',
            shareOwnerPhone: data.shareOwnerPhone ?? false,
            aiCustomInstructions: data.aiCustomInstructions || '',
          });
        }
      } catch {
        console.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/client/business-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const loadFacebookSDK = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v21.0',
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }, []);

  const handleConnectWhatsApp = async () => {
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    if (!configId) {
      setError('Meta configuration ID is not set. Please contact support.');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      await loadFacebookSDK();

      window.FB!.login(
        (response) => {
          if (response.authResponse?.code) {
            // Exchange code for token via our API
            exchangeCode(response.authResponse.code);
          } else {
            setConnecting(false);
            setError('WhatsApp signup was cancelled or failed. Please try again.');
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: 2,
          },
        }
      );
    } catch {
      setConnecting(false);
      setError('Failed to load Facebook SDK. Please try again.');
    }
  };

  const exchangeCode = async (code: string) => {
    try {
      const res = await fetch('/api/client/whatsapp-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect WhatsApp');
      }

      // Update form with new credentials
      setForm((prev) => ({
        ...prev,
        whatsappPhoneNumberId: data.phoneNumberId || '',
        whatsappBusinessId: data.wabaId || '',
        whatsappToken: '••••••••••••••••',
        whatsappAppSecret: '••••••••••••••••',
      }));
      setConnectedPhone(data.phoneNumber || 'Connected');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect WhatsApp');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp? You will need to reconnect to resume AI replies.')) {
      return;
    }

    setDisconnecting(true);
    setError('');

    try {
      const res = await fetch('/api/client/whatsapp-signup', { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to disconnect');
      }

      setForm((prev) => ({
        ...prev,
        whatsappPhoneNumberId: '',
        whatsappBusinessId: '',
        whatsappToken: '',
        whatsappAppSecret: '',
      }));
      setConnectedPhone('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect WhatsApp');
    } finally {
      setDisconnecting(false);
    }
  };

  const isWhatsAppConnected = !!(form.whatsappPhoneNumberId && form.whatsappToken);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  const isConfigured = form.whatsappPhoneNumberId && form.whatsappToken && form.openaiKey;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp AI Settings</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Configure your WhatsApp Business API and AI settings
          </p>
        </div>
        <Badge variant={isConfigured ? 'default' : 'secondary'}>
          {isConfigured ? 'Connected' : 'Not configured'}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Business Info */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            This info is used by AI to answer customer questions about your store.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                placeholder="Your store name"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does your store sell? e.g. We sell premium clothing and accessories"
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="storeHours">Store Hours</Label>
              <Input
                id="storeHours"
                value={form.storeHours}
                onChange={(e) => setForm({ ...form, storeHours: e.target.value })}
                placeholder="e.g. Mon-Sat 10AM-8PM"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location / Address</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Store address"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="locationUrl">Google Maps URL</Label>
              <Input
                id="locationUrl"
                value={form.locationUrl}
                onChange={(e) => setForm({ ...form, locationUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="policies">Store Policies</Label>
              <Textarea
                id="policies"
                value={form.policies}
                onChange={(e) => setForm({ ...form, policies: e.target.value })}
                placeholder="Return policy, shipping info, etc."
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="greeting">Custom Greeting Message</Label>
              <Input
                id="greeting"
                value={form.greeting}
                onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                placeholder="e.g. Welcome to our store! How can I help you today?"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ownerPhone">Owner WhatsApp Number</Label>
              <Input
                id="ownerPhone"
                value={form.ownerPhone}
                onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                placeholder="e.g. 919876543210 (with country code, no +)"
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                AI will notify you here when a customer needs personal attention (angry customer, complaints, escalations)
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, shareOwnerPhone: !form.shareOwnerPhone })}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    form.shareOwnerPhone ? 'bg-green-500' : 'bg-gray-300 dark:bg-neutral-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                      form.shareOwnerPhone ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {form.shareOwnerPhone ? 'Share this number with customers' : 'Do not share this number'}
                  </span>
                  <p className="text-xs text-gray-400">
                    {form.shareOwnerPhone
                      ? 'When a customer asks to talk to the owner, AI will share this number on WhatsApp'
                      : 'AI will tell the customer "we will get back to you soon" without sharing your number'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Connection */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp Connection</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Connect your WhatsApp Business account to enable AI auto-replies
          </p>

          {isWhatsAppConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    WhatsApp Connected
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {connectedPhone || `Phone ID: ${form.whatsappPhoneNumberId}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                >
                  <Unplug className="h-4 w-4 mr-1" />
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConnectWhatsApp}
                disabled={connecting}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all',
                  connecting
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                )}
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Connect WhatsApp
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Opens Facebook login — verify your phone number and SatyaSell handles the rest
              </p>
            </div>
          )}

          {/* Collapsible Manual Setup */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setShowManualSetup(!showManualSetup)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
            >
              {showManualSetup ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Advanced: Manual Setup
            </button>

            {showManualSetup && (
              <div className="space-y-4 mt-4">
                <p className="text-xs text-gray-400">
                  Get these from your Meta Developer Dashboard → WhatsApp → API Setup
                </p>
                <div>
                  <Label htmlFor="whatsappPhoneNumberId">Phone Number ID</Label>
                  <Input
                    id="whatsappPhoneNumberId"
                    value={form.whatsappPhoneNumberId}
                    onChange={(e) => setForm({ ...form, whatsappPhoneNumberId: e.target.value })}
                    placeholder="e.g. 123456789012345"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappBusinessId">WhatsApp Business Account ID</Label>
                  <Input
                    id="whatsappBusinessId"
                    value={form.whatsappBusinessId}
                    onChange={(e) => setForm({ ...form, whatsappBusinessId: e.target.value })}
                    placeholder="e.g. 123456789012345"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappToken">Permanent Access Token</Label>
                  <Input
                    id="whatsappToken"
                    type="password"
                    value={form.whatsappToken}
                    onChange={(e) => setForm({ ...form, whatsappToken: e.target.value })}
                    placeholder="Your WhatsApp API token"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappAppSecret">App Secret (for webhook verification)</Label>
                  <Input
                    id="whatsappAppSecret"
                    type="password"
                    value={form.whatsappAppSecret}
                    onChange={(e) => setForm({ ...form, whatsappAppSecret: e.target.value })}
                    placeholder="Meta App Secret"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Found in Meta Developer Dashboard → App Settings → Basic → App Secret
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Gateway Config */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateway</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Choose a payment gateway for WhatsApp order payments
          </p>

          <div className="space-y-4">
            <div>
              <Label>Gateway</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: 'none', label: 'None (COD)' },
                  { value: 'cashfree', label: 'Cashfree' },
                  { value: 'razorpay', label: 'Razorpay' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, paymentGateway: opt.value })}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                      form.paymentGateway === opt.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-neutral-300 dark:border-neutral-600 hover:border-purple-400'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.paymentGateway === 'cashfree' && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="cashfreeAppId">Cashfree App ID</Label>
                  <Input
                    id="cashfreeAppId"
                    value={form.cashfreeAppId}
                    onChange={(e) => setForm({ ...form, cashfreeAppId: e.target.value })}
                    placeholder="TEST... or your production App ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cashfreeSecretKey">Cashfree Secret Key</Label>
                  <Input
                    id="cashfreeSecretKey"
                    type="password"
                    value={form.cashfreeSecretKey}
                    onChange={(e) => setForm({ ...form, cashfreeSecretKey: e.target.value })}
                    placeholder="cfsk_..."
                    className="mt-1"
                  />
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    <strong>Cashfree Webhook URL</strong> (set in Cashfree Dashboard → Payment Links → Webhooks):
                  </p>
                  <code className="text-xs bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded block mt-1 text-emerald-700 dark:text-emerald-300 break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/cashfree` : '/api/webhook/cashfree'}
                  </code>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Fee: ~1.1% per transaction (lower than Razorpay)
                  </p>
                </div>
              </div>
            )}

            {form.paymentGateway === 'razorpay' && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                  <Input
                    id="razorpayKeyId"
                    value={form.razorpayKeyId}
                    onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                    placeholder="rzp_live_..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                  <Input
                    id="razorpayKeySecret"
                    type="password"
                    value={form.razorpayKeySecret}
                    onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                    placeholder="Your Razorpay Key Secret"
                    className="mt-1"
                  />
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Razorpay Webhook URL</strong> (set in Razorpay Dashboard → Webhooks):
                  </p>
                  <code className="text-xs bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded block mt-1 text-amber-700 dark:text-amber-300 break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/razorpay` : '/api/webhook/razorpay'}
                  </code>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Subscribe to: <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">payment_link.paid</code>
                  </p>
                </div>
              </div>
            )}

            {form.paymentGateway === 'none' && (
              <p className="text-sm text-gray-500 dark:text-neutral-400 pt-1">
                Orders will default to Cash on Delivery. No payment link will be sent.
              </p>
            )}
          </div>
        </div>

        {/* AI Config */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Configuration</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Get your API key from platform.openai.com
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <Input
                id="openaiKey"
                type="password"
                value={form.openaiKey}
                onChange={(e) => setForm({ ...form, openaiKey: e.target.value })}
                placeholder="sk-..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="aiCustomInstructions">Custom AI Instructions</Label>
              <Textarea
                id="aiCustomInstructions"
                value={form.aiCustomInstructions}
                onChange={(e) => setForm({ ...form, aiCustomInstructions: e.target.value })}
                placeholder="e.g. Always recommend our bestseller Puma bags. Never offer discounts over 10%. Always greet customers in Hindi first."
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Custom rules and instructions for the AI assistant. These will be followed in every conversation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="aiEnabled">AI Auto-Reply</Label>
              <button
                type="button"
                onClick={() => setForm({ ...form, aiEnabled: !form.aiEnabled })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.aiEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-neutral-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    form.aiEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
              <span className="text-sm text-gray-500">
                {form.aiEnabled ? 'Enabled - AI will auto-reply to messages' : 'Disabled - Only manual replies'}
              </span>
            </div>
          </div>
        </div>

        {/* Webhook Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Webhook URL (set in Meta Dashboard)</h2>
          <code className="text-sm bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 rounded block text-blue-700 dark:text-blue-300 break-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/whatsapp` : '/api/webhook/whatsapp'}
          </code>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Verify Token: <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">bizmanager_webhook_verify</code>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Subscribe to: <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">messages</code> webhook field
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
