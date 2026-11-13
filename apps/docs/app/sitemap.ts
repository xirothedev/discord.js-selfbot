import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

const buildDate = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    changeFrequency: 'weekly' as const,
    lastModified: buildDate,
    priority: page.url.startsWith('/docs/api') ? 0.6 : 0.7,
    url: `${siteUrl}${page.url}/`,
  }));

  return [
    {
      changeFrequency: 'weekly',
      lastModified: buildDate,
      priority: 1,
      url: `${siteUrl}/`,
    },
    ...pages,
  ];
}
