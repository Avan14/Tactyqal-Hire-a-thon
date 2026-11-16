import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
