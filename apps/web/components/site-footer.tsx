import Link from 'next/link';
import { nav, site } from '@/content/site';
import { NewsletterForm } from './newsletter-form';
import { Wordmark } from './wordmark';

export function SiteFooter() {
  return (
    <footer className="foot border-t-2 border-black">
      <div className="wrap flex flex-col gap-12 pt-14 pb-8">
        <div className="flex flex-wrap gap-x-6 gap-y-10">
          <div className="flex max-w-[420px] flex-[1_1_357px] flex-col gap-3">
            <Wordmark />
            <p className="small max-w-[34ch]">{site.description}</p>
          </div>
          <nav aria-label="Footer" className="flex-[1_1_260px]">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link className="inline-flex min-h-11 items-center" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <NewsletterForm />
        </div>
        <div className="small flex flex-wrap justify-between gap-x-6 gap-y-2 border-t-2 border-black pt-6">
          <span>© Tactyqal Labs</span>
          <span>
            {site.hours} ·{' '}
            <a className="text-[15px] underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
