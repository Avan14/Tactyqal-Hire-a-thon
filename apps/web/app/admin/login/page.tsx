import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <section className="flex max-w-[640px] flex-col gap-6" aria-labelledby="login-title">
      <h1 className="h2" id="login-title">
        Sign in
      </h1>
      <p>
        Enter the admin API token from the API’s environment (ADMIN_API_TOKEN). It is kept in an
        httpOnly cookie for this browser session and never exposed to page scripts.
      </p>
      <LoginForm />
    </section>
  );
}
