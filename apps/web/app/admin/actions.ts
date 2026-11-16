'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { clearAdminToken, requireAdminToken, setAdminToken } from '@/lib/admin-session';
import { POSTS_TAG } from '@/lib/blog';
import type { FieldError, Paginated, PostDetail, PostSummary } from '@/lib/types';
import type { FormState } from '../actions';

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = text(formData, 'token');
  if (!token) {
    return { status: 'error', fieldErrors: { token: 'Enter the admin token' } };
  }
  try {
    // Any admin-only read proves the token is valid.
    await api<Paginated<PostSummary>>('/posts?status=DRAFT&limit=1', { token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: 'error', fieldErrors: { token: 'That token was not accepted' } };
    }
    return { status: 'error', message: 'The blog service is not reachable right now.' };
  }
  await setAdminToken(token);
  redirect('/admin/posts');
}

export async function logout() {
  await clearAdminToken();
  redirect('/admin/login');
}

function postPayload(formData: FormData) {
  const optional = (key: string) => text(formData, key) || undefined;
  return {
    title: text(formData, 'title'),
    slug: optional('slug'),
    excerpt: optional('excerpt'),
    contentHtml: text(formData, 'contentHtml'),
    status: text(formData, 'status') || 'DRAFT',
    authorSlug: optional('authorSlug'),
    seoTitle: optional('seoTitle'),
    seoDescription: optional('seoDescription'),
    categories: formData.getAll('categories').filter((v): v is string => typeof v === 'string'),
  };
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
  const token = await requireAdminToken();
  const id = text(formData, 'id');
  const payload = postPayload(formData);
  const values = Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : (v ?? '')]),
  );

  let saved: PostDetail;
  try {
    saved = await api<PostDetail>(id ? `/posts/${id}` : '/posts', {
      method: id ? 'PATCH' : 'POST',
      token,
      body: payload,
    });
  } catch (err) {
    return toFormState(err, values);
  }

  // Read-your-own-writes: public pages show the change on the next request.
  updateTag(POSTS_TAG);
  redirect(`/admin/posts?saved=${encodeURIComponent(saved.slug)}`);
}

export async function deletePost(formData: FormData) {
  const token = await requireAdminToken();
  const id = text(formData, 'id');
  try {
    await api(`/posts/${id}`, { method: 'DELETE', token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/admin/login');
    if (!(err instanceof ApiError && err.status === 404)) throw err;
  }
  updateTag(POSTS_TAG);
  redirect('/admin/posts?deleted=1');
}
