import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getAllPostEntries } from '@/lib/blog';
import { siteUrl } from '@/lib/format';

/**
 * Built at request time from the cached post list, so new posts appear
 * without a rebuild. If the API is unreachable, the static pages are still
 * listed rather than failing the whole sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/blog'), changeFrequency: 'daily', priority: 0.8 },
  ];
  try {
    const posts = await getAllPostEntries();
    return [
      ...pages,
      ...posts.map((p) => ({
        url: siteUrl(`/blog/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return pages;
  }
}
