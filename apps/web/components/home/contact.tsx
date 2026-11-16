import { site } from '@/content/site';
import { Reveal } from '../reveal';
import { ContactForm } from './contact-form';

export function Contact() {
  const details = [
    { label: 'Email', value: site.email, href: `mailto:${site.email}` },
    { label: 'Phone', value: site.phone, href: site.phoneHref },
    { label: 'Hours', value: site.hours },
    { label: 'Response time', value: site.responseTime },
  ];

  return (
    <section className="sec bg-orange on-orange" id="contact" aria-labelledby="contact-title">
      <Reveal className="wrap split">
        <div className="split-head gap-8">
          <h2 className="h2" id="contact-title">
            Ready to Start Your Teen’s Success Story?
          </h2>
          <dl className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-8">
            {details.map((d) => (
              <div key={d.label} className="row flex flex-col gap-0.5 py-3.5">
                <dt className="small">{d.label}</dt>
                <dd>{d.href ? <a href={d.href}>{d.value}</a> : d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ContactForm />
      </Reveal>
    </section>
  );
}
