import { site } from '@/content/site';
import { Pops } from '../motion/pops';
import { Fade, Lines } from '../motion/reveal';
import { ContactForm } from './contact-form';

export function Contact() {
  return (
    <section className="final bg-blue" id="contact" data-hdr="light" aria-labelledby="contact-title">
      <Pops zone="final" />
      <Lines
        as="h2"
        id="contact-title"
        className="big disp"
        lines={['Ready to start', 'your teen’s', 'success story?']}
        lineClasses={[undefined, undefined, 'text-lime']}
      />
      <Fade as="p" className="lead relative z-2 mx-auto my-[4vh] max-w-[44ch]">
        Book a free consultation. We reply within 24 hours, {site.hours}.
      </Fade>
      <ContactForm />
      <div className="relative z-2 mt-[5vh] flex flex-wrap justify-center gap-7 text-[15px]">
        <a className="link" href={site.phoneHref}>Call or WhatsApp {site.phone}</a>
        <a className="link" href={`mailto:${site.email}`}>{site.email}</a>
      </div>
    </section>
  );
}
