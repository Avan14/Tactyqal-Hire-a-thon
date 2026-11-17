import Link from 'next/link';
import { pricing } from '@/content/site';
import { Lines } from '../motion/reveal';
import { PriceCard } from './price-card';

export function Pricing() {
  return (
    <section className="bg-ink" id="pricing" data-hdr="light" aria-labelledby="pricing-title">
      <div className="price">
        <div className="flex flex-col gap-[3vh]">
          <p className="eyebrow text-lime">{pricing.badge}</p>
          <Lines
            as="h2"
            id="pricing-title"
            className="disp"
            style={{ fontSize: 'min(11vw,19vh)' }}
            lines={['One program.', 'Everything', 'included.']}
            lineClasses={[undefined, 'text-lime', 'text-lime']}
          />
          <p className="lead max-w-[34ch] opacity-85">
            8 weeks, one mentor, one launched app. Not sure yet?{' '}
            <Link className="link" href="/#contact">Book a free consultation first.</Link>
          </p>
        </div>
        <PriceCard />
      </div>
    </section>
  );
}
