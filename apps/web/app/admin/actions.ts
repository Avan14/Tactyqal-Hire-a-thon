'use server';

import { updateTag } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { adminApi, clearAdminToken, setAdminToken } from '@/lib/admin-session';
import { POSTS_TAG } from '@/lib/blog';
import type { FieldError, Paginated, PostDetail, PostSummary } from '@/lib/types';
import type { FormState } from '../actions';

/** Post ids are UUIDs; anything else never reaches the API path. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = text(formData, 'token');
  if (!token) {
    return { status: 'error', fieldErrors: { token: 'Enter your access key' } };
  }
  try {
    // Any admin-only read proves the token is valid.
    await api<Paginated<PostSummary>>('/posts?status=DRAFT&limit=1', { token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: 'error', fieldErrors: { token: 'That access key isn’t valid. Check it and try again.' } };
    }
    return { status: 'error', message: 'We couldn’t reach the blog service. Please try again in a moment.' };
  }
  await setAdminToken(token);
  redirect('/admin/posts');
}

export async function logout() {
  await clearAdminToken();
  redirect('/admin/login');
}

/**
 * On create, empty optional fields are left out. On edit they are sent as
 * null, which the API reads as "clear this field" (an omitted field would
 * keep its old value, so "No author" or an emptied excerpt did nothing).
 */
function postPayload(formData: FormData, isEdit: boolean) {
  const optional = (key: string) => text(formData, key) || (isEdit ? null : undefined);
  return {
    title: text(formData, 'title'),
    // The slug is required once a post exists, so an empty one is left unchanged.
    slug: text(formData, 'slug') || undefined,
    excerpt: optional('excerpt'),
    contentHtml: text(formData, 'contentHtml'),
    status: text(formData, 'status') || 'DRAFT',
    authorSlug: optional('authorSlug'),
    seoTitle: optional('seoTitle'),
    seoDescription: optional('seoDescription'),
    categories: formData.getAll('categories').filter((v): v is string => typeof v === 'string'),
  };
}

function isLive(post: PostDetail): boolean {
  return post.status === 'PUBLISHED' && !!post.publishedAt && Date.parse(post.publishedAt) <= Date.now();
}

function toFormState(err: unknown, values: Record<string, string>): FormState {
  if (err instanceof ApiError) {
    if (err.status === 401) redirect('/admin/login');
    if (err.status === 409) {
      return { status: 'error', message: 'That slug is already used by another post.', fieldErrors: { slug: 'Already in use' }, values };
    }
    if (err.status === 400) {
      const fieldErrors: Record<string, string> = {};
      if (Array.isArray(err.details)) {
        for (const d of err.details as FieldError[]) fieldErrors[d.field] ??= d.messages[0] ?? 'Invalid value';
      }
      return { status: 'error', message: err.message === 'Validation failed' ? 'Please fix the highlighted fields.' : err.message, fieldErrors, values };
    }
  }
  return { status: 'error', message: 'Could not save the post. Please try again.', values };
}

/** Creates a post, or updates one when the form carries an id. */
export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, 'id');
  if (id && !UUID.test(id)) return { status: 'error', message: 'Could not save the post. Please try again.' };
  const payload = postPayload(formData, !!id);
  const values = Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : (v ?? '')]),
  );

  let saved: PostDetail;
  try {
    saved = await adminApi<PostDetail>(id ? `/posts/${id}` : '/posts', {
      method: id ? 'PATCH' : 'POST',
      body: payload,
    });
  } catch (err) {
    unstable_rethrow(err); // let the stale-token redirect through
    return toFormState(err, values);
  }

  // Read-your-own-writes: public pages show the change on the next request.
  updateTag(POSTS_TAG);
  redirect(`/admin/posts?saved=${encodeURIComponent(saved.slug)}${isLive(saved) ? '&live=1' : ''}`);
}

export async function deletePost(formData: FormData) {
  const id = text(formData, 'id');
  if (!UUID.test(id)) redirect('/admin/posts');
  try {
    await adminApi(`/posts/${id}`, { method: 'DELETE' });
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 404)) throw err;
  }
  updateTag(POSTS_TAG);
  redirect('/admin/posts?deleted=1');
}
