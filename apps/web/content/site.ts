/**
 * Single source of truth for homepage copy.
 *
 * Every string here comes from the live tactyqal.com homepage (captured
 * 2026-11-15) unless marked `EDITORIAL`. Editorial lines were added only
 * where the live site has a heading without supporting text, and should be
 * confirmed by the Tactyqal team before launch.
 */

export const site = {
  name: 'Tactyqal Labs',
  description:
    '8-week, 1:1 live mentoring that takes a teenager’s idea to a working full-stack app with no-code tools.',
  email: 'tactyqal.labs@gmail.com',
  phone: '+91-98047-72106',
  phoneHref: 'tel:+919804772106',
  hours: 'Mon–Sat, 9am–7pm',
  responseTime: 'Reply within 24 hours',
  /** The live site's tools section. Owner config: point at the tools app once it has its own URL. */
  toolsUrl: 'https://tactyqal.com/#tools',
} as const;

export const nav = [
  { label: 'Success Stories', href: '/#stories' },
  { label: 'Program', href: '/#program' },
  { label: 'Why Us', href: '/#why' },
  { label: 'Tools', href: '/#tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
] as const;

export const hero = {
  title: 'Empower Your Kid To Build The Next App That Impacts Millions, in 8 Weeks',
  support:
    '1:1 Mentoring • Idea To Full-Stack App • No Coding • Admissions To The Best Colleges • Grants • Media Coverage',
  facts: [
    { label: 'Duration', value: '8 weeks' },
    { label: 'Format', value: '1:1 live sessions, 1 hour each' },
    { label: 'Time commitment', value: 'About 2–3 hours per week' },
    { label: 'Build method', value: 'No-code' },
  ],
} as const;

export interface StudentApp {
  name: string;
  description: string;
  detail?: string;
}

export const studentApps: StudentApp[] = [
  {
    name: 'KrishiDrishti',
    description: 'AI soil analysis and crop recommendations for Indian farmers',
  },
  {
    name: 'Elenor Vegan Handbags',
    description: 'Corporate gifting platform',
    detail: 'Started by a 16-year-old · INR 9,000 in its first week',
  },
  {
    name: 'One Last Chapter',
    description: 'Children’s book subscription service',
    detail: 'Started by a 13-year-old · About INR 100,000 monthly revenue',
  },
  { name: 'Paws of Promise', description: 'Virtual pet adoption app' },
  { name: 'AudioNova', description: 'AI music and video production company' },
  {
    name: 'Converza',
    description: 'Spanish learning app with an AI bot named Luna',
  },
];

export interface ProgramStage {
  weeks: string;
  name: string;
  /** Lines shown when the stage is opened. */
  points: string[];
  /** Free tools from the site that support this stage. */
  tools: string[];
}

export const program = {
  title: 'From Idea to Full App in 8 Weeks',
  banner: 'Personal 1:1 Live Sessions • 1 Hour Each • Expert Guidance',
  stages: [
    {
      weeks: 'Week 1–2',
      name: 'Ideation & Market Research',
      points: [
        'Startup Ideas 101: learn how to identify and validate profitable startup ideas from our founder.',
      ],
      tools: ['Startup Idea Generator', 'Problem-Solution Fit'],
    },
    {
      weeks: 'Week 3–4',
      name: 'Design & Prototyping',
      points: [
        // EDITORIAL: the live site names this stage but gives no detail.
        'Turn the validated idea into screens and a working prototype, reviewed in every 1:1 session.',
      ],
      tools: ['Website Landing Page Assessment'],
    },
    {
      weeks: 'Week 5–6',
      name: 'Full-Stack Development',
      points: ['Build real apps using modern no-code tools and platforms.'],
      tools: [],
    },
    {
      weeks: 'Week 7–8',
      name: 'Launch & Marketing',
      points: [
        'Learn to pitch, present, and launch on Product Hunt.',
        'Includes pitch deck creation and a marketing strategy.',
      ],
      tools: ['Pitch Deck Analyzer'],
    },
  ] satisfies ProgramStage[],
};

export const benefits = [
  {
    title: '1:1 Personalized Mentoring',
    text: 'Every student gets dedicated, expert guidance. No group classes.',
  },
  {
    title: 'Full Stack App with No-Code',
    text: 'Build real apps using modern no-code tools and platforms.',
  },
  {
    title: 'Proven Track Record',
    text: '50+ successful students, real revenue, and top university admits.',
  },
  {
    title: 'University Admission Edge',
    text: 'Stand out in applications with real-world projects and achievements.',
  },
  {
    title: 'Revenue Generation',
    text: 'Students learn to build, launch, and monetize their own apps.',
  },
  {
    title: 'Life Long Support',
    text: 'From ideation to launch, students master the full journey.',
  },
  {
    title: 'Pitch & Presentation Skills',
    text: 'Learn to pitch, present, and launch on Product Hunt.',
  },
  {
    title: 'Startup Ideas 101',
    text: 'Learn how to identify and validate profitable startup ideas from our founder.',
  },
] as const;

export const testimonials = [
  { name: 'Aarav Sharma', quote: 'I had to struggle to find a tech cofounder' },
  { name: 'Isha Patel', quote: 'Now I feel independent and can build anything I want' },
  { name: 'Rohan Verma', quote: 'It’s the future' },
  {
    name: 'Simran Kaur',
    quote:
      'I can focus on the creative side and don’t have to worry about whether it can be built',
  },
  { name: 'Devansh Mehta', quote: 'I went on from having no idea to launching my app' },
  { name: 'Priya Nair', quote: 'My impact app was only in my head till I built it' },
] as const;

export const tools = {
  title: 'Free Tools to Get Started',
  intro: 'Explore our startup assessment tools used by 1000+ entrepreneurs',
  items: [
    'Startup Idea Generator',
    'Fundability Assessment',
    'Team Evaluation Tool',
    'Pitch Deck Analyzer',
    'Top 10 Traits For Business Success',
    'Cofounder Compatibility Test',
    'Problem-Solution Fit',
    'Website Landing Page Assessment',
  ],
} as const;

export const pricing = {
  badge: 'Limited Time Offer',
  price: 'Rs 16,000',
  previous: 'Rs 25,000',
  includes: [
    '8 weeks of 1:1 mentoring',
    'Full-stack app development',
    'Product Hunt launch',
    'Pitch deck creation',
    'Marketing strategy',
    'Ongoing support',
  ],
  notes: ['Results guaranteed or money back', 'Only 15 spots available for the month'],
} as const;

export const faqs = [
  {
    q: 'What if my teen has no coding experience?',
    a: 'No problem! Our program is designed for beginners. We use no-code tools and guide students step-by-step.',
  },
  {
    q: 'How do you guarantee university admissions?',
    a: 'We help students build standout projects that strengthen their university applications.',
  },
  {
    q: 'What kind of apps do students typically build?',
    a: 'Apps range from AI-powered tools, e-commerce platforms, subscription services, to social good projects. We help students pick ideas that excite them.',
  },
  {
    q: 'How much time commitment is required?',
    a: 'About 2-3 hours per week, including 1 hour of live mentoring and independent work.',
  },
  {
    q: 'What is the success rate?',
    a: '100% of our students launch a working app and achieve their goals.',
  },
  {
    q: 'Can my teen generate real revenue?',
    a: 'Yes! Many of our students have generated real revenue and even won grants & media coverage.',
  },
  {
    q: 'What universities have your students gotten into?',
    a: 'Our alumni have been admitted to top universities in the US, UK, including Ivy League.',
  },
  {
    q: 'What ongoing support do you provide?',
    a: 'We offer ongoing support, alumni community, and guidance even after the program ends.',
  },
] as const;
