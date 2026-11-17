'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { pricing } from '@/content/site';
import { gsap, prefersReducedMotion } from '@/lib/motion';

const toNumber = (s: string) => Number(s.replace(/[^\d]/g, ''));
const inr = (n: number) => `Rs ${Math.round(n).toLocaleString('en-IN')}`;

/** The offer card: the price counts down from the old price as it scrolls in. */
export function PriceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const price = toNumber(pricing.price), previous = toNumber(pricing.previous);

  useEffect(() => {
    const card = ref.current;
    if (!card || prefersReducedMotion()) return;
    const amt = card.querySelector<HTMLElement>('.amt');
    const ctx = gsap.context(() => {
      gsap.from(card, { y: 80, rotate: 6, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 85%' } });
      const o = { v: previous };
      gsap.to(o, { v: price, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%', once: true }, onUpdate: () => { if (amt) amt.textContent = inr(o.v); } });
      if (matchMedia('(hover:hover) and (pointer:fine) and (min-width: 821px)').matches) {
        card.addEventListener('mouseenter', () => gsap.to(card, { rotate: 0, y: -4, duration: 0.3, ease: 'expo.out' }));
        card.addEventListener('mouseleave', () => gsap.to(card, { rotate: 1.2, y: 0, duration: 0.3, ease: 'expo.out' }));
      }
    }, card);
    return () => ctx.revert();
  }, [price, previous]);

  return (
    <div className="pcard" ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <b className="disp text-[28px]">8-week 1:1 program</b>
        <span className="badge">Save {inr(previous - price)}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="amt">{inr(price)}</span>
        <s>{inr(previous)}</s>
      </div>
      <p className="-mt-2 text-muted">Previously {pricing.previous}. {pricing.notes[1]}.</p>
      <ul className="ticks">
        {pricing.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="note"><b>{pricing.notes[0]}.</b></p>
      <Link className="bigbtn" href="/#contact">Enroll now →</Link>
      <Link className="text-center font-semibold underline underline-offset-4" href="/#contact">Or book a free consultation first</Link>
    </div>
  );
}
