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
      <p className="lead">Manage the Tactyqal blog: write, edit, publish and remove articles.</p>
      <LoginForm />
    </section>
  );
}

async function ExpiredNotice({ searchParams }: Pick<PageProps<'/admin/login'>, 'searchParams'>) {
  const { expired } = await searchParams;
  if (!expired) return null;
  return (
    <p role="status" className="status">
      Your session has expired. Please sign in again.
    </p>
  );
}
