'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** GSAP with ScrollTrigger registered once. Client components import from here. */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPhone(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= 820;
}

/** Viewport-relative numbers that stay correct after a resize (used in scrubbed tweens). */
export const vh = (n: number) => () => (window.innerHeight * n) / 100;
export const vw = (n: number) => () => (window.innerWidth * n) / 100;
