import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, ApiError } from './api';

export const ADMIN_COOKIE = 'tq_admin';
const EIGHT_HOURS = 60 * 60 * 8;

/**
 * The admin token lives only in an httpOnly, same-site cookie scoped to
 * /admin. Client JavaScript never sees it, and Server Actions read it on the
 * server to call the API.
 */
export async function getAdminToken(): Promise<string | undefined> {
  return (await cookies()).get(ADMIN_COOKIE)?.value;
}

export async function requireAdminToken(): Promise<string> {
  const token = await getAdminToken();
  if (!token) redirect('/admin/login');
  return token;
}

export async function setAdminToken(token: string) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: EIGHT_HOURS,
  });
}

export async function clearAdminToken() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
}

/**
 * Calls the API as the signed-in admin. A rejected token (for example after
 * ADMIN_API_TOKEN was rotated) sends the admin back to the login page
 * instead of failing the page.
 */
export async function adminApi<T>(path: string, init: Omit<Parameters<typeof api>[1], 'token'> = {}): Promise<T> {
  const token = await requireAdminToken();
  try {
    return await api<T>(path, { ...init, token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Cookies can only be changed in Server Actions; during a page render
      // the login action overwrites the stale cookie instead.
      await clearAdminToken().catch(() => undefined);
      redirect('/admin/login?expired=1');
    }
    throw err;
  }
}
