import Link from 'next/link';
import { nav } from '@/content/site';
import { MobileNav } from './mobile-nav';
import { Wordmark } from './wordmark';

export function SiteHeader() {
  return (
    <header className="relative border-b-2 border-black">
      <div className="wrap flex min-h-[72px] items-center justify-between gap-6">
        <Wordmark />
        <nav className="nav nav-desktop items-center gap-6" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="btn btn-primary nav-cta" href="/#contact">
          Book Free Consultation
        </Link>
        <MobileNav />
      </div>
    </header>
  );
}
