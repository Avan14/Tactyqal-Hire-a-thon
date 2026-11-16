/** Response shapes of the Tactyqal blog API (apps/api). */

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface Term {
  name: string;
  slug: string;
}

export interface TermWithCount extends Term {
  postCount: number;
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  status: PostStatus;
  publishedAt: string | null;
  readingMinutes: number;
  author: Term | null;
  categories: Term[];
  tags: Term[];
}

export interface PostDetail extends PostSummary {
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface FieldError {
  field: string;
  messages: string[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}
