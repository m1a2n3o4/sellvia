'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUpload, AIAnalysisResult } from '@/components/products/image-upload';
import { AIProductForm } from '@/components/products/ai-product-form';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface TabItem {
  id: string;
  imageUrl: string;
  prediction: AIAnalysisResult['prediction'];
  saved: boolean;
}

export default function AICreatePage() {
  const router = useRouter();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  const handleAnalyzed = useCallback((result: AIAnalysisResult) => {
    const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTab: TabItem = {
      id,
      imageUrl: result.imageUrl,
      prediction: result.prediction,
      saved: false,
    };
    setTabs(prev => [...prev, newTab]);
    // Auto-select first tab or newly added tab
    setActiveTab(prev => prev || id);
  }, []);

  const handleSaved = (tabId: string) => {
    setTabs(prev => prev.map(t => (t.id === tabId ? { ...t, saved: true } : t)));
    // Auto-advance to next unsaved tab
    const nextUnsaved = tabs.find(t => t.id !== tabId && !t.saved);
    if (nextUnsaved) {
      setActiveTab(nextUnsaved.id);
    }
  };

  const handleDiscard = (tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTab === tabId) {
      const remaining = tabs.filter(t => t.id !== tabId);
      setActiveTab(remaining[0]?.id || '');
    }
  };

  const allSaved = tabs.length > 0 && tabs.every(t => t.saved);
  const savedCount = tabs.filter(t => t.saved).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Product Creator
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Upload product images and let AI auto-detect product details
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <ImageUpload
        onAnalyzed={handleAnalyzed}
        maxFiles={10}
      />

      {/* All saved success message */}
      {allSaved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              All {savedCount} product{savedCount !== 1 ? 's' : ''} saved successfully!
            </span>
          </div>
          <Button
            variant="link"
            className="mt-1 p-0 h-auto text-green-700 dark:text-green-400"
            onClick={() => router.push('/client/products')}
          >
            Back to Products
          </Button>
        </div>
      )}

      {/* Product tabs */}
      {tabs.length > 0 && !allSaved && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 max-w-[180px]"
              >
                {tab.saved && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                <span className="truncate text-xs">
                  {tab.prediction?.name || 'Untitled'}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.saved ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-6 rounded-lg text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Product saved successfully</p>
                </div>
              ) : (
                <AIProductForm
                  imageUrl={tab.imageUrl}
                  initialData={tab.prediction}
                  onSaved={() => handleSaved(tab.id)}
                  onDiscard={() => handleDiscard(tab.id)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Empty state */}
      {tabs.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-neutral-400">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p>Upload product images above to get started</p>
          <p className="text-sm mt-1">AI will analyze each image and pre-fill the product details</p>
        </div>
      )}
    </div>
  );
}
