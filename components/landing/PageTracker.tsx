'use client';

import { useEffect } from 'react';

export function PageTracker() {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: '/' }),
    }).catch(() => {});
  }, []);

  return null;
}
