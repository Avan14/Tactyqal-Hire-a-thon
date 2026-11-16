'use client';

import { useActionState } from 'react';
import { subscribe, type FormState } from '@/app/actions';

const initial: FormState = { status: 'idle' };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initial);
  const error = state.fieldErrors?.email;

  return (
    <form action={action} className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-1.5" noValidate>
      <label htmlFor="newsletter-email" className="text-[15px] font-extrabold">
        Newsletter
      </label>
      {state.status === 'success' ? (
        <p role="status" className="small border-4 border-black bg-[#ff6b35] p-4">
          {state.message}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              className="input w-auto flex-[1_1_200px]"
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              required
              defaultValue={state.values?.email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error || state.message ? 'newsletter-msg' : undefined}
            />
            <button className="btn btn-secondary" type="submit" disabled={pending}>
              {pending ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          {(error || state.message) && (
            <p id="newsletter-msg" role="alert" className="err">
              {error ? 'Enter a valid email address' : state.message}
            </p>
          )}
        </>
      )}
    </form>
  );
}
