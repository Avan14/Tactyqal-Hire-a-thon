import Link from 'next/link';
import { hero } from '@/content/site';

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="wrap flex flex-col items-start gap-8 py-[clamp(56px,8cqi,112px)]">
        <h1 className="h1 hero-wipe max-w-[1240px]" id="hero-title">
          {hero.title}
        </h1>
        <p className="measure text-[clamp(18px,1.8cqi,20px)]">{hero.support}</p>
        <div className="flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="#contact">
            Book Free Consultation
          </Link>
          <Link className="btn btn-secondary" href="#stories">
            Success Stories
          </Link>
        </div>
        <dl className="mt-4 grid w-full grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-x-6 border-y-4 border-black">
          {hero.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 py-5">
              <dt className="small">{fact.label}</dt>
              <dd className="h3">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
