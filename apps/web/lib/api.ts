import 'server-only';
import type { ApiErrorBody } from './types';

const API_URL = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 8_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequest extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Admin bearer token for write endpoints. */
  token?: string;
}

/**
 * Server-side client for the blog API. Never imported by client components,
 * so the API URL and admin token stay on the server.
 */
export async function api<T>(path: string, { body, token, headers, ...init }: ApiRequest = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      // A hung API must not hang page renders: fail fast into the error state.
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ApiError(503, 'API_UNREACHABLE', 'The blog service is not reachable right now.', cause);
  }

  if (res.status === 204) return undefined as T;

  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? `HTTP_${res.status}`,
      error?.message ?? res.statusText,
      error?.details,
    );
  }
  return payload as T;
}
