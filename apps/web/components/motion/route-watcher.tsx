'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const ROUTE_EVENT = 'tq:route';
/** Sections that manage their own header colour (the pinned hero) announce it with this event. */
export const HEADER_EVENT = 'tq:hdr';

/**
 * Renders nothing. Announces client-side route changes as a window event so
 * the header and scroll code can rebuild their triggers without reading the
 * pathname themselves (which would make the whole layout dynamic).
 */
export function RouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: pathname }));
  }, [pathname]);
  return null;
}
