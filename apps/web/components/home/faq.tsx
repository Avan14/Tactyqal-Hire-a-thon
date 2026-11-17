import { faqs } from '@/content/site';
import { Fade, Lines } from '../motion/reveal';

/** Native <details>: keyboard and screen-reader friendly with no JavaScript. */
export function Faq() {
  return (
    <section className="bg-cream" id="faq" data-hdr="dark" aria-labelledby="faq-title">
      <div className="faq">
        <Lines as="h2" id="faq-title" className="disp mb-[6vh] text-blue" style={{ fontSize: 'min(12vw,20vh)' }} lines={['Straight', 'answers.']} />
        <Fade>
          {faqs.map((item, i) => (
            <details key={item.q} className="qa" name="faq">
              <summary aria-controls={`ans-${i}`}>
                <span>{item.q}</span>
                <i aria-hidden="true">+</i>
              </summary>
              <p className="ans" id={`ans-${i}`}>{item.a}</p>
            </details>
          ))}
        </Fade>
      </div>
    </section>
  );
}
