const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Jul 9, 2025". Fixed locale and time zone so server and client render the same text. */
export function formatDate(iso: string | null): string {
  return iso ? dateFormat.format(new Date(iso)) : 'Unpublished';
}

/**
 * The public origin of the site, for canonical links, the sitemap and Open
 * Graph tags. SITE_URL wins; on Vercel the production domain is the fallback.
 * A value without a protocol gets https://, and one that is not a valid URL
 * is skipped, so a typo in an environment variable can never break the build.
 */
function siteOrigin(): string {
  for (const raw of [process.env.SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
    } catch {
      /* try the next candidate */
    }
  }
  return 'http://localhost:3000';
}

export function siteUrl(path = ''): string {
  return `${siteOrigin()}${path}`;
}
