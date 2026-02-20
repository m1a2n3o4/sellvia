'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share, Plus, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPage() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Capture the beforeinstallprompt event (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Already Installed!</h1>
          <p className="text-gray-600 mt-2">SatyaSell is on your home screen. Open it from there.</p>
          <a href="/client" className="inline-block mt-6">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8">
              Open App
            </Button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
    >
      {/* Logo + Branding */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-4xl font-bold">S</span>
        </div>
        <h1 className="text-white text-3xl font-bold">SatyaSell</h1>
        <p className="text-white/70 mt-1">AI-Powered Business Management</p>
      </motion.div>

      {/* Install Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Install App</h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Add SatyaSell to your home screen for the best experience
        </p>

        {/* Android — one-tap install button */}
        {platform === 'android' && deferredPrompt && (
          <div className="space-y-4">
            <Button
              onClick={handleInstall}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full text-base h-12"
            >
              <Download className="h-5 w-5 mr-2" />
              Install SatyaSell
            </Button>
            <p className="text-xs text-gray-400 text-center">No app store needed. Opens instantly.</p>
          </div>
        )}

        {/* Android — fallback if prompt not captured */}
        {platform === 'android' && !deferredPrompt && (
          <div className="space-y-5">
            <p className="text-sm text-gray-700 font-medium text-center">Follow these steps:</p>
            <Step number={1} icon={<MoreVertical className="h-5 w-5" />}>
              Tap the <strong>3 dots</strong> (⋮) at the top-right corner
            </Step>
            <Step number={2} icon={<Download className="h-5 w-5" />}>
              Tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>
            </Step>
            <Step number={3} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}>
              Tap <strong>Install</strong> — Done!
            </Step>
          </div>
        )}

        {/* iOS — step-by-step instructions */}
        {platform === 'ios' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-700 font-medium text-center">Follow these steps in Safari:</p>
            <Step number={1} icon={<Share className="h-5 w-5" />}>
              Tap the <strong>Share</strong> button <span className="text-lg">↑</span> at the bottom
            </Step>
            <Step number={2} icon={<Plus className="h-5 w-5" />}>
              Scroll down, tap <strong>&quot;Add to Home Screen&quot;</strong>
            </Step>
            <Step number={3} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}>
              Tap <strong>Add</strong> — Done!
            </Step>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>Important:</strong> This must be opened in <strong>Safari</strong>, not Chrome. If you&apos;re in Chrome, copy the link and paste it in Safari.
            </div>
          </div>
        )}

        {/* Desktop */}
        {platform === 'desktop' && deferredPrompt && (
          <div className="space-y-4">
            <Button
              onClick={handleInstall}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full text-base h-12"
            >
              <Download className="h-5 w-5 mr-2" />
              Install SatyaSell
            </Button>
          </div>
        )}

        {platform === 'desktop' && !deferredPrompt && (
          <div className="space-y-5">
            <p className="text-sm text-gray-700 font-medium text-center">In Chrome:</p>
            <Step number={1} icon={<MoreVertical className="h-5 w-5" />}>
              Click the <strong>install icon</strong> in the address bar (or 3 dots → Install)
            </Step>
            <Step number={2} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}>
              Click <strong>Install</strong> — Done!
            </Step>
          </div>
        )}

        {/* Skip to web */}
        <div className="mt-6 text-center">
          <a href="/client" className="text-sm text-purple-600 hover:underline">
            or continue in browser →
          </a>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-3 gap-4 max-w-sm w-full"
      >
        {[
          { label: 'Offline Ready', emoji: '⚡' },
          { label: 'No App Store', emoji: '🚀' },
          { label: 'Always Updated', emoji: '✨' },
        ].map((f) => (
          <div key={f.label} className="text-center">
            <span className="text-2xl">{f.emoji}</span>
            <p className="text-white/80 text-xs mt-1">{f.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex items-start gap-2 pt-1">
        <div className="text-gray-400 flex-shrink-0 mt-0.5">{icon}</div>
        <p className="text-sm text-gray-700 leading-snug">{children}</p>
      </div>
    </div>
  );
}
