import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/client/', '/superadmin/', '/api/'] },
    sitemap: 'https://www.satyasell.com/sitemap.xml',
  };
}
