'use server';

import { headers } from 'next/headers';
import { api, ApiError } from '@/lib/api';
import type { FieldError } from '@/lib/types';

export interface FormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of submitted values so the form keeps them after an error. */
  values?: Record<string, string>;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/** Forward the visitor's IP so the API rate-limits per visitor, not per web server. */
async function forwardedFor(): Promise<Record<string, string>> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip');
  return ip ? { 'X-Forwarded-For': ip } : {};
}

function toFormError(err: unknown, values: Record<string, string>): FormState {
  if (err instanceof ApiError) {
    if (err.status === 400 && Array.isArray(err.details)) {
      const fieldErrors: Record<string, string> = {};
      for (const d of err.details as FieldError[]) {
        fieldErrors[d.field] ??= d.messages[0] ?? 'Invalid value';
      }
      return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values };
    }
    if (err.status === 429) {
      return { status: 'error', message: 'Too many attempts. Please wait a minute and try again.', values };
    }
  }
  return {
    status: 'error',
    message: 'Something went wrong on our side. Please try again, or email us directly.',
    values,
  };
}

export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    message: text(formData, 'message'),
  };
  try {
    await api('/leads', {
      method: 'POST',
      headers: await forwardedFor(),
      body: {
        ...values,
        phone: values.phone || undefined,
        website: text(formData, 'website') || undefined,
      },
    });
    return {
      status: 'success',
      message: 'Thanks! We have your request and will reply within 24 hours.',
    };
  } catch (err) {
    return toFormError(err, values);
  }
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, 'email') };
  try {
    await api('/subscribers', {
      method: 'POST',
      headers: await forwardedFor(),
      body: values,
    });
    return { status: 'success', message: 'You’re subscribed. Thanks for reading!' };
  } catch (err) {
    return toFormError(err, values);
  }
}
