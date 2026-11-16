import {
  decodeEntities,
  htmlToText,
  readingMinutes,
  sanitizePostHtml,
} from '../../src/posts/content';

/** The subset of the WordPress REST API post shape (with `_embed`) that we use. */
export interface WpTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

export interface WpPost {
  id: number;
  date_gmt: string;
  slug: string;
  status: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    og_image?: { url: string }[];
  };
  _embedded?: {
    author?: { id: number; name: string; slug: string; description?: string }[];
    'wp:featuredmedia'?: { source_url?: string }[];
    'wp:term'?: WpTerm[][];
  };
}

export interface MappedTerm {
  wpId: number;
  name: string;
  slug: string;
}

export interface MappedPost {
  wpId: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  readingMinutes: number;
  publishedAt: Date;
  featuredImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  author: (MappedTerm & { bio: string | null }) | null;
  categories: MappedTerm[];
  tags: MappedTerm[];
}

const UNCATEGORIZED: MappedTerm = {
  wpId: 1,
  name: 'Uncategorized',
  slug: 'uncategorized',
};

/**
 * The WordPress site has both "Uncategorized" and "Uncategorised".
 * They are merged into one term during import.
 */
export function normalizeTerm(term: WpTerm): MappedTerm {
  if (term.slug === 'uncategorised' || term.slug === 'uncategorized') {
    return UNCATEGORIZED;
  }
  return {
    wpId: term.id,
    name: decodeEntities(term.name).trim(),
    slug: term.slug,
  };
}

function termsOf(post: WpPost, taxonomy: 'category' | 'post_tag'): WpTerm[] {
  return (post._embedded?.['wp:term'] ?? [])
    .flat()
    .filter((t) => (t.taxonomy ?? taxonomy) === taxonomy);
}

function uniqueBySlug(terms: MappedTerm[]): MappedTerm[] {
  return [...new Map(terms.map((t) => [t.slug, t])).values()];
}

/** "Uncategorized" adds nothing when the post already has a real category. */
function cleanCategories(terms: MappedTerm[]): MappedTerm[] {
  const unique = uniqueBySlug(terms);
  const real = unique.filter((t) => t.slug !== UNCATEGORIZED.slug);
  return real.length > 0 ? real : unique;
}

function plainExcerpt(html: string): string {
  return htmlToText(html)
    .replace(/\s*(\[(…|\.\.\.)\]|Continue reading.*)$/i, '')
    .trim();
}

export function mapWpPost(post: WpPost): MappedPost {
  const contentHtml = sanitizePostHtml(post.content.rendered);
  const author = post._embedded?.author?.[0];
  const yoast = post.yoast_head_json;
  const featured =
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
    yoast?.og_image?.[0]?.url ??
    null;

  return {
    wpId: post.id,
    slug: post.slug,
    title: decodeEntities(post.title.rendered).trim(),
    excerpt: plainExcerpt(post.excerpt.rendered),
    contentHtml,
    readingMinutes: readingMinutes(contentHtml),
    publishedAt: new Date(`${post.date_gmt}Z`),
    featuredImageUrl: featured,
    seoTitle: yoast?.title ? decodeEntities(yoast.title) : null,
    seoDescription: yoast?.description
      ? decodeEntities(yoast.description)
      : null,
    canonicalUrl: yoast?.canonical ?? null,
    author: author
      ? {
          wpId: author.id,
          name: decodeEntities(author.name),
          slug: author.slug,
          bio: author.description?.trim() || null,
        }
      : null,
    categories: cleanCategories(termsOf(post, 'category').map(normalizeTerm)),
    tags: uniqueBySlug(termsOf(post, 'post_tag').map(normalizeTerm)),
  };
}
