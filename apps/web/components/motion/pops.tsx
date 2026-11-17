'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, isPhone, prefersReducedMotion } from '@/lib/motion';

const ICON: Record<string, string> = {
  check: '<path d="M5 12l4.5 4.5L19 7"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>',
  user: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M19 8v6M16 11h6"/>',
  deck: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
  rocket: '<path d="M12 3c3 2 5 5.5 5 9.5L15 15H9l-2-2.5C7 8.5 9 5 12 3z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9 15l-2 4 3-1M15 15l2 4-3-1"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  rupee: '<path d="M7 4h10M7 8.5h10M7 4h3a4.5 4.5 0 0 1 0 9H7l7 7"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
};

/** Moments from the program and from real student apps, shown as app notifications. */
const POPS: [string, string, string, string][] = [
  ['Idea validated', 'Startup Ideas 101, week 1', '#e4ff3a', 'check'],
  ['Prototype shared', 'Weeks 3–4: design & prototyping', '#dfe4ff', 'share'],
  ['Your app is live', 'Built with no-code tools', '#ffd2bd', 'phone'],
  ['New sign-up', 'Someone just joined your app', '#e5f0dc', 'user'],
  ['Pitch deck ready', 'Pitch & presentation skills', '#fdf2cf', 'deck'],
  ['Launch day', 'You are live on Product Hunt', '#ff8a57', 'rocket'],
  ['1:1 session', 'Your mentor, 1 hour, today', '#ece5f7', 'cal'],
  ['First order', 'Elenor Vegan Handbags', '#dbf1ec', 'rupee'],
  ['Soil report ready', 'KrishiDrishti', '#e5f0dc', 'leaf'],
  ['¡Hola! Soy Luna', 'Converza', '#dbf1ec', 'chat'],
  ['New subscriber', 'One Last Chapter', '#fde2d3', 'book'],
];
const ZONES: Record<string, [number, number]> = { hero: [52, 80], apps: [8, 26], stats: [56, 84], final: [2, 9] };
let popIdx = 0;

/**
 * A layer of notification cards that drift up and fade, one every `every`
 * ms while the parent section is on screen. Decorative only: hidden from
 * assistive tech, off on phones and under reduced motion.
 */
export function Pops({ zone, every = 1900 }: { zone: keyof typeof ZONES; every?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = ref.current;
    if (!layer || prefersReducedMotion() || isPhone()) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const spawn = () => {
      if (document.hidden || layer.querySelectorAll('.pop').length >= 2) return;
      const [t, sub, c, ic] = POPS[popIdx++ % POPS.length];
      const el = document.createElement('div');
      el.className = 'pop';
      el.innerHTML = `<i style="background:${c}"><svg viewBox="0 0 24 24" fill="none" stroke="#14162e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[ic]}</svg></i><span><b>${t}</b><small>${sub}</small></span>`;
      const left = layer.dataset.side !== 'left';
      layer.dataset.side = left ? 'left' : 'right';
      const [y0, y1] = ZONES[zone];
      el.style.top = `${y0 + Math.random() * (y1 - y0)}%`;
      if (left) el.style.left = `${3 + Math.random() * 12}%`;
      else el.style.right = `${3 + Math.random() * 12}%`;
      layer.appendChild(el);
      gsap.timeline({ onComplete: () => el.remove() })
        .fromTo(el, { opacity: 0, scale: 0.95, y: 14 }, { opacity: 1, scale: 1, y: 0, rotate: gsap.utils.random(-2.5, 2.5), duration: 0.55, ease: 'expo.out' })
        .to(el, { y: -26, duration: 3, ease: 'none' }, 0)
        .to(el, { opacity: 0, y: '-=6', duration: 0.25, ease: 'power2.in' }, 2.75);
    };
    const start = () => { if (!timer) { spawn(); timer = setInterval(spawn, every); } };
    const stop = () => { clearInterval(timer); timer = undefined; };
    const st = ScrollTrigger.create({ trigger: layer.parentElement, start: 'top 70%', end: 'bottom 30%', onToggle: (s) => (s.isActive ? start() : stop()) });
    return () => { stop(); st.kill(); };
  }, [zone, every]);
  return <div ref={ref} className="pops" aria-hidden="true" />;
}
