import { faqs } from '@/content/site';
import { PlusIcon } from '../icons';
import { Reveal } from '../reveal';

/** Native <details>: keyboard and screen-reader friendly with no JavaScript. */
export function Faq() {
  return (
    <section className="sec bg-white" id="faq" aria-labelledby="faq-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="faq-title">
            FAQ
          </h2>
        </div>
        <div className="split-body faq rows">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>
                <span>{item.q}</span>
                <PlusIcon />
              </summary>
              <p className="ans">{item.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
