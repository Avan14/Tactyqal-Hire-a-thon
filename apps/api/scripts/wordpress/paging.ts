export interface PageRequest {
  page: number;
  /** Sent as per_page. Constant across requests so offsets line up. */
  perPage: number;
  /** How many posts of this page to keep. */
  take: number;
}

/**
 * The requests needed to fetch the newest `limit` posts.
 * WordPress computes offset = (page - 1) * per_page, so per_page must stay
 * the same on every request; the last page is trimmed with `take` instead.
 */
export function planPages(limit: number, batchSize: number): PageRequest[] {
  const perPage = Math.min(batchSize, limit);
  const pages = Math.ceil(limit / perPage);
  return Array.from({ length: pages }, (_, i) => ({
    page: i + 1,
    perPage,
    take: Math.min(perPage, limit - i * perPage),
  }));
}

/** WordPress answers 400 with this code when asked for a page past the last. */
export function isPastLastPage(status: number, body: unknown): boolean {
  return (
    status === 400 &&
    (body as { code?: unknown } | null)?.code ===
      'rest_post_invalid_page_number'
  );
}
