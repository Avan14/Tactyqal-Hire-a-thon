import { IntroLoader } from '@/components/motion/intro-loader';
import { Contact } from '@/components/home/contact';
import { Fab } from '@/components/home/fab';
import { Faq } from '@/components/home/faq';
import { Hero } from '@/components/home/hero';
import { Pricing } from '@/components/home/pricing';
import { Program } from '@/components/home/program';
import { Statement } from '@/components/home/statement';
import { Stats } from '@/components/home/stats';
import { StudentApps } from '@/components/home/student-apps';
import { Testimonials } from '@/components/home/testimonials';
import { Tools } from '@/components/home/tools';
import { WhyUs } from '@/components/home/why-us';
import { faqs, site } from '@/content/site';
import { siteUrl } from '@/lib/format';

/** Organization and FAQ structured data, built from the same copy the page shows. */
function StructuredData() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: site.name,
      url: siteUrl('/'),
      email: site.email,
      telephone: site.phone,
      description: site.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      // Static, trusted data from content/site.ts; '<' is escaped defensively.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <IntroLoader />
      <Hero />
      <Statement />
      <StudentApps />
      <Program />
      <Stats />
      <WhyUs />
      <Testimonials />
      <Pricing />
      <Tools />
      <Faq />
      <Contact />
      <Fab />
    </>
  );
}
