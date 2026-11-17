/**
 * Coordination between the intro loader and the hero.
 *
 * The loader plays once per browser session, only on the homepage, and never
 * for visitors who prefer reduced motion. The hero holds its entrance until
 * the loader has left, so the two do not play over each other.
 */
export const INTRO_DONE_EVENT = 'tq:intro-done';
export const INTRO_SEEN_KEY = 'tq-seen';

declare global {
  interface Window {
    __tqIntroDone?: boolean;
  }
}

/** True when the loader should play for this visit. */
export function introShouldPlay(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    /* storage can be blocked; the loader then simply plays again next time */
  }
}

export function announceIntroDone() {
  window.__tqIntroDone = true;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

/** Runs `fn` now if no loader is pending, otherwise once it has finished. */
export function afterIntro(fn: () => void): () => void {
  if (window.__tqIntroDone || !introShouldPlay()) {
    fn();
    return () => {};
  }
  const run = () => fn();
  window.addEventListener(INTRO_DONE_EVENT, run, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, run);
}
