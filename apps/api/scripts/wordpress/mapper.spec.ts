import { mapWpPost, normalizeTerm, WpPost } from './mapper';

function wpPost(overrides: Partial<WpPost> = {}): WpPost {
  return {
    id: 13280,
    date_gmt: '2025-07-09T22:03:35',
    slug: '50-no-code-startup-ideas-to-build-without-programming-skills',
    status: 'publish',
    title: { rendered: '50 No-Code Startup Ideas &#8211; Build Without Code' },
    content: {
      rendered:
        '<p>You&#8217;re sitting in a coffee shop.</p><script>x()</script>' +
        '<figure class="wp-block-embed"><iframe src="https://www.youtube.com/embed/UyUH06CfLbk?feature=oembed"></iframe></figure>',
    },
    excerpt: {
      rendered: '<p>You&#8217;re sitting in a coffee shop [&hellip;]</p>',
    },
    yoast_head_json: {
      title: '50 No-Code Startup Ideas - Tactyqal',
      description: 'Build a startup without programming skills.',
      canonical:
        'https://tactyqal.com/blog/50-no-code-startup-ideas-to-build-without-programming-skills/',
      og_image: [
        {
          url: 'https://tactyqal.com/blog/wp-content/uploads/2025/07/cover.png',
        },
      ],
    },
    _embedded: {
      author: [
        {
          id: 2,
          name: 'Partha Chakraborty',
          slug: 'partha',
          description: 'VC turned founder.',
        },
      ],
      'wp:term': [
        [
          {
            id: 58,
            name: 'Startup business ideas',
            slug: 'startup-business-ideas',
            taxonomy: 'category',
          },
          {
            id: 1,
            name: 'Uncategorized',
            slug: 'uncategorized',
            taxonomy: 'category',
          },
        ],
        [
          {
            id: 63,
            name: 'Startup business ideas',
            slug: 'startup-business-ideas',
            taxonomy: 'post_tag',
          },
        ],
      ],
    },
    ...overrides,
  };
}

describe('mapWpPost', () => {
  it('keeps the WordPress slug so existing /blog/{slug}/ URLs survive', () => {
    expect(mapWpPost(wpPost()).slug).toBe(
      '50-no-code-startup-ideas-to-build-without-programming-skills',
    );
  });

  it('decodes HTML entities in the title', () => {
    expect(mapWpPost(wpPost()).title).toBe(
      '50 No-Code Startup Ideas – Build Without Code',
    );
  });

  it('treats WordPress GMT dates as UTC', () => {
    expect(mapWpPost(wpPost()).publishedAt.toISOString()).toBe(
      '2025-07-09T22:03:35.000Z',
    );
  });

  it('sanitizes the body but keeps the YouTube embed', () => {
    const { contentHtml } = mapWpPost(wpPost());
    expect(contentHtml).not.toContain('<script>');
    expect(contentHtml).toContain('https://www.youtube.com/embed/UyUH06CfLbk');
  });

  it('turns the excerpt into plain text without the read-more marker', () => {
    expect(mapWpPost(wpPost()).excerpt).toBe('You’re sitting in a coffee shop');
  });

  it('carries over Yoast SEO fields and the featured image', () => {
    expect(mapWpPost(wpPost())).toMatchObject({
      seoTitle: '50 No-Code Startup Ideas - Tactyqal',
      seoDescription: 'Build a startup without programming skills.',
      canonicalUrl:
        'https://tactyqal.com/blog/50-no-code-startup-ideas-to-build-without-programming-skills/',
      featuredImageUrl:
        'https://tactyqal.com/blog/wp-content/uploads/2025/07/cover.png',
    });
  });

  it('maps the embedded author', () => {
    expect(mapWpPost(wpPost()).author).toEqual({
      wpId: 2,
      name: 'Partha Chakraborty',
      slug: 'partha',
      bio: 'VC turned founder.',
    });
  });

  it('drops Uncategorized when the post has a real category', () => {
    expect(mapWpPost(wpPost()).categories).toEqual([
      {
        wpId: 58,
        name: 'Startup business ideas',
        slug: 'startup-business-ideas',
      },
    ]);
  });

  it('keeps Uncategorized when it is the only category', () => {
    const post = wpPost();
    post._embedded!['wp:term'] = [
      [
        {
          id: 16,
          name: 'Uncategorised',
          slug: 'uncategorised',
          taxonomy: 'category',
        },
      ],
      [],
    ];
    expect(mapWpPost(post).categories).toEqual([
      { wpId: 1, name: 'Uncategorized', slug: 'uncategorized' },
    ]);
  });

  it('maps tags', () => {
    expect(mapWpPost(wpPost()).tags).toEqual([
      {
        wpId: 63,
        name: 'Startup business ideas',
        slug: 'startup-business-ideas',
      },
    ]);
  });

  it('copes with a post that has no embedded data', () => {
    const mapped = mapWpPost(
      wpPost({ _embedded: undefined, yoast_head_json: undefined }),
    );
    expect(mapped.author).toBeNull();
    expect(mapped.categories).toEqual([]);
    expect(mapped.seoTitle).toBeNull();
  });
});

describe('normalizeTerm', () => {
  it('merges the British-spelling duplicate into Uncategorized', () => {
    expect(
      normalizeTerm({ id: 16, name: 'Uncategorised', slug: 'uncategorised' }),
    ).toEqual({
      wpId: 1,
      name: 'Uncategorized',
      slug: 'uncategorized',
    });
  });

  it('decodes entities in term names', () => {
    expect(
      normalizeTerm({ id: 5, name: 'Pitch &amp; Present', slug: 'pitch' }).name,
    ).toBe('Pitch & Present');
  });
});
