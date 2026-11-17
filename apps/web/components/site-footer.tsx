import Link from 'next/link';
import { nav, site } from '@/content/site';
import { FooterGiant } from './motion/footer-giant';
import { NewsletterForm } from './newsletter-form';

export function SiteFooter() {
  return (
    <footer className="foot bg-orange" data-hdr="dark">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
        <nav aria-label="Footer" className="frow">
          <div>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <NewsletterForm />
      </div>
      <p className="small mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[12px] opacity-80">
        <span>© Tactyqal Labs</span>
        <span>{site.hours}</span>
      </p>
      <FooterGiant />
    </footer>
  );
}
