import { Contact } from '@/components/home/contact';
import { Faq } from '@/components/home/faq';
import { Hero } from '@/components/home/hero';
import { LatestPosts } from '@/components/home/latest-posts';
import { Pricing } from '@/components/home/pricing';
import { Program } from '@/components/home/program';
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
      <Hero />
      <StudentApps />
      <Program />
      <WhyUs />
      <Testimonials />
      <Tools />
      <Pricing />
      <Faq />
      <LatestPosts />
      <Contact />
    </>
  );
}
