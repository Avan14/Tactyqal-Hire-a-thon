'use client';

import { useActionState } from 'react';
import { login } from '@/app/admin/actions';
import type { FormState } from '@/app/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { status: 'idle' } as FormState);
  const error = state.fieldErrors?.token;

  return (
    <form action={action} className="card flex flex-col gap-5">
      {state.message && (
        <p role="alert" className="alert">
          {state.message}
        </p>
      )}
      <div className="field">
        <label htmlFor="token">Access key</label>
        <input
          id="token"
          name="token"
          type="password"
          className="input"
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'token-hint token-err' : 'token-hint'}
        />
        <p id="token-hint" className="text-[14px] text-muted">
          Use the admin access key from your Tactyqal team. You’ll stay signed in on this browser for 8 hours.
        </p>
        {error && (
          <p id="token-err" className="err">
            {error}
          </p>
        )}
      </div>
      <button className="btn btn-primary self-start" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
