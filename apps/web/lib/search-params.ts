export interface BlogFilters {
  page: number;
  category?: string;
  q?: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Turns raw URL search params into safe filters. Bad values are dropped
 * rather than sent to the API, so a mangled URL shows results, not an error.
 */
export function parseBlogFilters(raw: Record<string, string | string[] | undefined>): BlogFilters {
  const page = Number(first(raw.page));
  const category = first(raw.category);
  const q = first(raw.q)?.trim().slice(0, 200);
  return {
    page: Number.isInteger(page) && page > 0 && page < 10_000 ? page : 1,
    category: category && SLUG.test(category) ? category : undefined,
    q: q || undefined,
  };
}

export function blogHref(filters: Partial<BlogFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : '/blog';
}
