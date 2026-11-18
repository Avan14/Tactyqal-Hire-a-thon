'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';
import { HEADER_EVENT, ROUTE_EVENT } from './motion/route-watcher';
import { scrollToTarget } from './motion/smooth-scroll';
import { Wordmark } from './wordmark';

const primary = [
  { label: 'Student apps', href: '/#stories' },
  { label: 'How it works', href: '/#program' },
  { label: 'Pricing', href: '/#pricing' },
];

/**
 * Fixed header that takes its colour from the section under it (sections
 * declare `data-hdr="dark|light"`), hides on scroll down, and opens a
 * full-screen menu. The menu is a <nav> that is simply hidden when closed.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const [routeKey, setRouteKey] = useState(0);
  const openRef = useRef(false);
  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    const onRoute = () => setRouteKey((k) => k + 1);
    const onHeader = (e: Event) => setDark(!!(e as CustomEvent<{ dark: boolean }>).detail?.dark);
    window.addEventListener(ROUTE_EVENT, onRoute);
    window.addEventListener(HEADER_EVENT, onHeader);
    return () => {
      window.removeEventListener(ROUTE_EVENT, onRoute);
      window.removeEventListener(HEADER_EVENT, onHeader);
    };
  }, []);

  // Colour follows the section at the top edge; cream pages default to dark.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-hdr]'));
    if (sections.length === 0) return;
    const triggers = sections.map((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 34px',
        end: 'bottom 34px',
        onToggle: (s) => s.isActive && setDark(sec.dataset.hdr === 'dark'),
      }),
    );
    let lastY = 0;
    const hide = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const y = s.scroll();
        if (!openRef.current) setHidden(y > lastY && y > 300);
        lastY = y;
      },
    });
    const progress = gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    return () => {
      triggers.forEach((t) => t.kill());
      hide.kill();
      progress.scrollTrigger?.kill();
      progress.kill();
    };
  }, [routeKey]);

  // Menu open/close animation and body lock.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const lenis = window.__lenis;
    if (open) {
      document.body.classList.add('locked');
      lenis?.stop();
      const tl = gsap.timeline();
      if (prefersReducedMotion()) {
        gsap.set(menu, { visibility: 'visible', clipPath: 'inset(0 0 0% 0)' });
      } else {
        tl.set(menu, { visibility: 'visible' })
          .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power4.inOut' })
          .fromTo(menu.querySelectorAll('.ln > span'), { yPercent: 110, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.28)
          .fromTo(menu.querySelectorAll('.mi'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' }, 0.5);
      }
      menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      return () => {
        tl.kill();
      };
    }
    document.body.classList.remove('locked');
    lenis?.start();
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: prefersReducedMotion() ? 0 : 0.45, ease: 'power4.inOut', onComplete: () => { gsap.set(menu, { visibility: 'hidden' }); } });
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  // Same-page anchors scroll smoothly through Lenis; other routes navigate normally.
  const go = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hash = href.startsWith('/#') ? href.slice(1) : null;
    if (hash && window.location.pathname === '/') {
      e.preventDefault();
      setOpen(false);
      setTimeout(() => scrollToTarget(hash), open ? 500 : 0);
    } else {
      setOpen(false);
    }
  };

  const light = !dark && !open;
  return (
    <>
      <div className="progress" id="progress" aria-hidden="true" />
      <header className={`hdr ${light ? '' : 'dark'} ${hidden && !open ? 'hidden' : ''}`.trim()} style={open ? { color: 'var(--color-cream)', background: 'var(--color-ink)' } : undefined}>
        <Link href={primary[0].href} className="c1" onClick={go(primary[0].href)}>
          <span className="roll"><span data-t={primary[0].label}>{primary[0].label}</span></span>
        </Link>
        <Link href={primary[1].href} className="c2" onClick={go(primary[1].href)}>
          <span className="roll"><span data-t={primary[1].label}>{primary[1].label}</span></span>
        </Link>
        <Wordmark />
        <Link href={primary[2].href} className="c4" onClick={go(primary[2].href)}>
          <span className="roll"><span data-t={primary[2].label}>{primary[2].label}</span></span>
        </Link>
        <div className="right">
          <Link className="pill" data-cursor="BOOK" href="/#contact" onClick={go('/#contact')}>
            Book a free call
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu">
            <span className="roll"><span data-t={open ? 'Close' : 'Menu'}>{open ? 'Close' : 'Menu'}</span></span>
          </button>
        </div>
      </header>

      <nav className="menu" id="site-menu" ref={menuRef} aria-label="Site menu" aria-hidden={!open} data-lenis-prevent>
        <ol className="disp">
          {nav.map((item, i) => (
            <li key={item.href} className="ln">
              <span>
                <Link href={item.href} onClick={go(item.href)} tabIndex={open ? 0 : -1}>
                  <sup>{String(i + 1).padStart(2, '0')}</sup>
                  {item.label}
                </Link>
              </span>
            </li>
          ))}
        </ol>
        <div className="side">
          <ul>
            <li className="mi"><Link href="/#contact" onClick={go('/#contact')} tabIndex={open ? 0 : -1}>Book a free call</Link></li>
            <li className="mi"><a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>Pick a time on our calendar ↗</a></li>
            <li className="mi"><a href={site.toolsUrl} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>Free startup tools ↗</a></li>
            <li className="mi"><Link href="/blog" onClick={go('/blog')} tabIndex={open ? 0 : -1}>Blog</Link></li>
          </ul>
          <p className="mi">
            Call or WhatsApp {site.phone}
            <br />
            {site.email}
            <br />
            {site.hours}
          </p>
        </div>
      </nav>
    </>
  );
}
