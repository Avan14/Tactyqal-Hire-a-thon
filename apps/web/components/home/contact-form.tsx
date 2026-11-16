'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitLead, type FormState } from '@/app/actions';

const initial: FormState = { status: 'idle' };

const FRIENDLY: Record<string, string> = {
  name: 'Please tell us your name',
  email: 'Enter a valid email address',
  phone: 'Enter a valid phone number',
  message: 'Please add a short message',
};

export function ContactForm() {
  const [state, action, pending] = useActionState(submitLead, initial);
  const statusRef = useRef<HTMLDivElement>(null);

  // Move focus to the outcome so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (state.status !== 'idle') statusRef.current?.focus();
  }, [state]);

  if (state.status === 'success') {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="split-body card flex max-w-[960px] flex-col gap-3 p-[clamp(24px,4cqi,40px)] shadow-[12px_12px_0_0_#000]"
      >
        <p className="h3">Request received</p>
        <p>{state.message}</p>
      </div>
    );
  }

  const error = (field: string) => state.fieldErrors?.[field] && FRIENDLY[field];
  const fieldProps = (field: string) => ({
    id: `c-${field}`,
    name: field,
    defaultValue: state.values?.[field],
    'aria-invalid': error(field) ? true : undefined,
    'aria-describedby': error(field) ? `c-${field}-err` : undefined,
  });
  const fieldError = (field: string) =>
    error(field) && (
      <p id={`c-${field}-err`} className="err">
        {error(field)}
      </p>
    );

  return (
    <form
      action={action}
      noValidate
      className="split-body card relative flex max-w-[960px] flex-col gap-5 p-[clamp(24px,4cqi,40px)] shadow-[12px_12px_0_0_#000]"
    >
      {state.status === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border-4 border-black bg-[#ff6b35] p-4">
          <p className="small">{state.message}</p>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input className="input" type="text" autoComplete="name" required maxLength={100} {...fieldProps('name')} />
          {fieldError('name')}
        </div>
        <div className="field">
          <label htmlFor="c-email">Email</label>
          <input className="input" type="email" autoComplete="email" required {...fieldProps('email')} />
          {fieldError('email')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-phone">Phone (optional)</label>
        <input className="input" type="tel" autoComplete="tel" {...fieldProps('phone')} />
        {fieldError('phone')}
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <textarea className="input" rows={5} required maxLength={2000} {...fieldProps('message')} />
        {fieldError('message')}
      </div>
      {/* Honeypot: hidden from people, filled only by bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Book a Free Appointment'}
        </button>
        <span className="small">We reply within 24 hours.</span>
      </div>
    </form>
  );
}
