import {
  decodeEntities,
  excerptFrom,
  readingMinutes,
  sanitizePostHtml,
  slugify,
  uniqueSlug,
} from './content';

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('How Does Ramp Make Money?')).toBe(
      'how-does-ramp-make-money',
    );
  });

  it('spells out ampersands and drops other punctuation', () => {
    expect(slugify('Problem Solving & Decision Making!')).toBe(
      'problem-solving-and-decision-making',
    );
  });

  it('folds accented characters to ASCII', () => {
    expect(slugify('Café Résumé Ideas')).toBe('cafe-resume-ideas');
  });

  it('collapses repeated separators and trims the ends', () => {
    expect(slugify('  --LGBTQ+   founders--  ')).toBe('lgbtq-founders');
  });

  it('caps length at 80 characters without cutting a word in half', () => {
    const slug = slugify('word '.repeat(40));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
    expect(slug.split('-').every((w) => w === 'word')).toBe(true);
  });

  it('returns an empty string when nothing usable remains', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('uniqueSlug', () => {
  it('returns the base slug when it is free', async () => {
    await expect(
      uniqueSlug('ideas', () => Promise.resolve(false)),
    ).resolves.toBe('ideas');
  });

  it('appends the first free numeric suffix on collision', async () => {
    const taken = new Set(['ideas', 'ideas-2']);
    await expect(
      uniqueSlug('ideas', (s) => Promise.resolve(taken.has(s))),
    ).resolves.toBe('ideas-3');
  });

  it('falls back to "post" when the base is empty', async () => {
    await expect(uniqueSlug('', () => Promise.resolve(false))).resolves.toBe(
      'post',
    );
  });
});

describe('sanitizePostHtml', () => {
  it('removes script tags and inline event handlers', () => {
    const out = sanitizePostHtml(
      '<p onclick="steal()">Hi</p><script>alert(1)</script>',
    );
    expect(out).toBe('<p>Hi</p>');
  });

  it('removes javascript: links but keeps the link text', () => {
    const out = sanitizePostHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('x');
  });

  it('keeps headings, lists, tables and figures used by WordPress posts', () => {
    const html =
      '<h2>A</h2><h3>B</h3><ul><li>c</li></ul>' +
      '<figure class="wp-block-table"><table><thead><tr><th>h</th></tr></thead>' +
      '<tbody><tr><td>d</td></tr></tbody></table><figcaption>cap</figcaption></figure>';
    expect(sanitizePostHtml(html)).toBe(
      html.replace(' class="wp-block-table"', ''),
    );
  });

  it('keeps YouTube embeds, switched to the privacy-enhanced domain', () => {
    const html =
      '<iframe src="https://www.youtube.com/embed/UyUH06CfLbk?start=5" title="Talk" allowfullscreen></iframe>';
    expect(sanitizePostHtml(html)).toContain(
      'src="https://www.youtube-nocookie.com/embed/UyUH06CfLbk?start=5"',
    );
  });

  it('lazy-loads embeds and gives untitled ones an accessible title', () => {
    const out = sanitizePostHtml(
      '<iframe src="https://www.youtube.com/embed/abc"></iframe>',
    );
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('title="Embedded video"');
  });

  it('removes iframes from any other host', () => {
    expect(
      sanitizePostHtml('<iframe src="https://evil.example.com/x"></iframe>'),
    ).toBe('');
  });

  it('forces external links to open safely', () => {
    const out = sanitizePostHtml(
      '<a href="https://example.com" target="_blank">e</a>',
    );
    expect(out).toContain('rel="noopener noreferrer"');
  });
});

describe('readingMinutes', () => {
  it('estimates at 220 words per minute, rounding up', () => {
    const words = Array.from({ length: 450 }, () => 'word').join(' ');
    expect(readingMinutes(`<p>${words}</p>`)).toBe(3);
  });

  it('never returns less than one minute', () => {
    expect(readingMinutes('')).toBe(1);
  });

  it('ignores markup when counting words', () => {
    expect(readingMinutes('<h2 class="x">one</h2><p>two</p>')).toBe(1);
  });
});

describe('excerptFrom', () => {
  it('strips tags and decodes common entities', () => {
    expect(excerptFrom('<p>You&#8217;re here &amp; <b>now</b></p>')).toBe(
      'You’re here & now',
    );
  });

  it('truncates at a word boundary with an ellipsis', () => {
    const out = excerptFrom(`<p>${'alpha '.repeat(60)}</p>`, 50);
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toContain('alph…');
  });

  it('returns short text unchanged', () => {
    expect(excerptFrom('<p>Short</p>')).toBe('Short');
  });
});

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('Fish &amp; chips &#8211; &#x2019;s')).toBe(
      'Fish & chips – ’s',
    );
  });

  it('leaves out-of-range code points as written instead of throwing', () => {
    expect(decodeEntities('a &#99999999; b &#x110000; c')).toBe(
      'a &#99999999; b &#x110000; c',
    );
  });
});
