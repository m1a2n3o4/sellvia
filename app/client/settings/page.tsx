'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle } from 'lucide-react';
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
  openaiKey: string;
  aiEnabled: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
    openaiKey: '',
    aiEnabled: true,
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
            openaiKey: data.openaiKey || '',
            aiEnabled: data.aiEnabled ?? true,
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
          </div>
        </div>

        {/* WhatsApp API Config */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp API Configuration</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Get these from your Meta Developer Dashboard → WhatsApp → API Setup
          </p>

          <div className="space-y-4">
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
