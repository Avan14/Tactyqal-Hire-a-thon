import sanitizeHtml from 'sanitize-html';

/** Pure helpers for post content. No I/O, so they are cheap to unit test. */

const MAX_SLUG_LENGTH = 80;
const WORDS_PER_MINUTE = 220;
const YOUTUBE_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
];

export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // strip combining accent marks
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= MAX_SLUG_LENGTH) return slug;
  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
}

/**
 * Returns `base`, or `base-2`, `base-3`… whichever is free first.
 * The database unique constraint stays the final guard against races.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base || 'post';
  if (!(await isTaken(root))) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }
}

function isYouTubeEmbed(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return (
      url.protocol === 'https:' &&
      YOUTUBE_HOSTS.includes(url.hostname) &&
      url.pathname.startsWith('/embed/')
    );
  } catch {
    return false;
  }
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: [
      'src',
      'title',
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'loading',
    ],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http'] },
  allowedIframeHostnames: YOUTUBE_HOSTS,
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? '');
      return {
        tagName,
        attribs: external
          ? { ...attribs, rel: 'noopener noreferrer' }
          : attribs,
      };
    },
    // YouTube's privacy-enhanced domain sets no tracking cookies until the
    // reader presses play. Embeds load lazily and always carry a title.
    iframe: (tagName, attribs) => {
      if (!isYouTubeEmbed(attribs.src)) return { tagName, attribs };
      const url = new URL(attribs.src);
      url.hostname = 'www.youtube-nocookie.com';
      return {
        tagName,
        attribs: {
          ...attribs,
          src: url.toString(),
          loading: 'lazy',
          title: attribs.title || 'Embedded video',
        },
      };
    },
  },
  // Drop iframes whose source is not a YouTube embed, rather than leaving
  // an empty frame behind.
  exclusiveFilter: (frame) =>
    frame.tag === 'iframe' && !isYouTubeEmbed(frame.attribs.src),
};

/** Allow-list sanitizer: everything not explicitly allowed is removed. */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

/** Decodes numeric entities and the named entities WordPress emits. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n =
        code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      // fromCodePoint throws above U+10FFFF, so leave those as written.
      return Number.isInteger(n) && n <= 0x10ffff
        ? String.fromCodePoint(n)
        : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Plain text from HTML: tags removed, entities decoded, whitespace collapsed. */
export function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingMinutes(html: string): number {
  const text = htmlToText(html);
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function excerptFrom(html: string, maxLength = 200): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(
    /[\s,.;:!?-]+$/,
    '',
  );
  return `${trimmed}…`;
}
