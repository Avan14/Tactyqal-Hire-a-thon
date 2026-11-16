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

export function siteUrl(path = ''): string {
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path}`;
}
