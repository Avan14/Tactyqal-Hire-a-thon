import Link from 'next/link';
import { pricing } from '@/content/site';
import { CheckIcon } from '../icons';
import { Reveal } from '../reveal';

export function Pricing() {
  return (
    <section className="sec" id="pricing" aria-labelledby="pricing-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="pricing-title">
            Pricing
          </h2>
        </div>
        <div className="split-body card flex max-w-[1040px] flex-wrap gap-x-12 gap-y-8 p-[clamp(24px,4cqi,40px)] shadow-[16px_16px_0_0_#000]">
          <div className="flex flex-[1_1_260px] flex-col items-start gap-4">
            <p className="badge">{pricing.badge}</p>
            <div className="flex flex-col gap-1">
              <p className="text-[clamp(56px,8cqi,112px)] leading-[0.9] font-black tracking-[-0.05em] tabular-nums [text-shadow:4px_4px_0_#ff6b35]">
                {pricing.price}
              </p>
              <p>
                Previously <s>{pricing.previous}</s>
              </p>
            </div>
            <Link className="btn btn-primary mt-2" href="#contact">
              Enroll Now
            </Link>
            <ul className="small mt-2 flex flex-col gap-1">
              {pricing.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-[1_1_300px] flex-col gap-3">
            <p className="small">Includes</p>
            <ul className="flex flex-col">
              {pricing.includes.map((item) => (
                <li key={item} className="flex items-center gap-3 border-t-2 border-black py-3">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
