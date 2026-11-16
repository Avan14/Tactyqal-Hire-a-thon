'use client';

import { catchError, type ErrorInfo } from 'next/error';

function LoadErrorFallback(props: { title?: string }, { retry }: ErrorInfo) {
  return (
    <div role="alert" className="row rows flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="h3">{props.title ?? 'Articles could not be loaded'}</p>
        <p>Check your connection and try again.</p>
      </div>
      <button className="btn btn-secondary" type="button" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}

/** Error boundary with the comp's error state and a working retry. */
export const LoadErrorBoundary = catchError(LoadErrorFallback);
