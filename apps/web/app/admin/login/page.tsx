import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage(props: PageProps<'/admin/login'>) {
  return (
    <section className="flex max-w-[640px] flex-col gap-6" aria-labelledby="login-title">
      <h1 className="h2" id="login-title">
        Sign in
      </h1>
      <Suspense fallback={null}>
        <ExpiredNotice searchParams={props.searchParams} />
      </Suspense>
      <p>
        Enter the admin API token from the API’s environment (ADMIN_API_TOKEN). It is kept in an
        httpOnly cookie for this browser session and never exposed to page scripts.
      </p>
      <LoginForm />
    </section>
  );
}

async function ExpiredNotice({ searchParams }: Pick<PageProps<'/admin/login'>, 'searchParams'>) {
  const { expired } = await searchParams;
  if (!expired) return null;
  return (
    <p role="status" className="status">
      Your session is no longer valid. The admin token may have changed. Please sign in again.
    </p>
  );
}
