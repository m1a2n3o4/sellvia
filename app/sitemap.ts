import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.satyasell.com';
  return ['', '/about', '/contact', '/privacy-policy', '/terms', '/refund-policy', '/data-deletion'].map((p) => ({
    url: base + p,
    lastModified: new Date(),
  }));
}
