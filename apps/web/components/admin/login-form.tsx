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
        <p role="alert" className="small border-4 border-black bg-[#ff6b35] p-4">
          {state.message}
        </p>
      )}
      <div className="field">
        <label htmlFor="token">Admin token</label>
        <input
          id="token"
          name="token"
          type="password"
          className="input"
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'token-err' : undefined}
        />
        {error && (
          <p id="token-err" className="err">
            {error}
          </p>
        )}
      </div>
      <button className="btn btn-primary self-start" type="submit" disabled={pending}>
        {pending ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}
