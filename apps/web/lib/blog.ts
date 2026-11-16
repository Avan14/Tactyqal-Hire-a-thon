import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { api, ApiError } from './api';
import type { Paginated, PostDetail, PostSummary, TermWithCount } from './types';

/**
 * Cached public reads. Every entry is tagged 'posts', and admin mutations
 * call updateTag('posts') so readers see changes immediately. The 'minutes'
 * lifetime bounds staleness for edits made straight through the API.
 */
export const POSTS_TAG = 'posts';

export interface PostQuery {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  q?: string;
}

function toQueryString(query: PostQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getPosts(query: PostQuery): Promise<Paginated<PostSummary>> {
  'use cache';
  cacheLife('minutes');
  cacheTag(POSTS_TAG);
  return api<Paginated<PostSummary>>(`/posts${toQueryString(query)}`);
}

/** Returns null when the post does not exist or is not published. */
export async function getPost(slug: string): Promise<PostDetail | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(POSTS_TAG, `post:${slug}`);
  try {
    return await api<PostDetail>(`/posts/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getAuthors(): Promise<TermWithCount[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(POSTS_TAG);
  return api<TermWithCount[]>('/authors');
}

export async function getCategories(): Promise<TermWithCount[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(POSTS_TAG);
  return api<TermWithCount[]>('/categories');
}
