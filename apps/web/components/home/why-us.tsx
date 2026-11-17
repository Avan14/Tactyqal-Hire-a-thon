import Link from 'next/link';
import { benefits, site } from '@/content/site';
import { Fade } from '../motion/reveal';
import { LatestPosts } from './latest-posts';

/** Why parents choose Tactyqal, beside the newest articles from the blog API. */
export function WhyUs() {
  return (
    <section className="bg-cream" data-hdr="dark" aria-labelledby="why-title">
      <div className="duo">
        <Fade className="box bg-white">
          <p className="eyebrow text-blue">Why parents choose Tactyqal Labs</p>
          <h2 className="h2 text-[clamp(36px,4vw,62px)]" id="why-title">Built for the application, and for real revenue.</h2>
          <ul className="arrows">
            {benefits.map((b) => (
              <li key={b.title}>
                <span><b>{b.title}.</b> {b.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-muted">
            Questions first? <Link className="link" href="/#contact">Book a free consultation</Link> or email {site.email}.
          </p>
        </Fade>
        <Fade className="box bg-lime" id="blog">
          <LatestPosts />
        </Fade>
      </div>
    </section>
  );
}
