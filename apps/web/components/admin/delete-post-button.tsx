'use client';

import { useFormStatus } from 'react-dom';
import { deletePost } from '@/app/admin/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-secondary btn-sm" type="submit" disabled={pending}>
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}
