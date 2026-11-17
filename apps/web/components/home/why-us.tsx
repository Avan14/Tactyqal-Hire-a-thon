import Link from 'next/link';
import { benefits, founderLesson, site } from '@/content/site';
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
          <a
            className="video"
            href={`https://www.youtube.com/watch?v=${founderLesson.youtubeId}&t=${founderLesson.start}s`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="eyebrow opacity-85">Free lesson · Startup Ideas 101</span>
            <b>{founderLesson.title}</b>
            <span className="dur">With {founderLesson.speaker} · YouTube</span>
            <span className="play" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#14162e"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="sr-only"> (opens YouTube in a new tab)</span>
          </a>
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
