import { isPastLastPage, planPages } from './paging';

describe('planPages', () => {
  it('keeps per_page constant so WordPress offsets line up', () => {
    // WordPress computes offset = (page - 1) * per_page. Shrinking per_page
    // on the last request would re-fetch earlier posts and skip later ones.
    expect(planPages(50, 20)).toEqual([
      { page: 1, perPage: 20, take: 20 },
      { page: 2, perPage: 20, take: 20 },
      { page: 3, perPage: 20, take: 10 },
    ]);
  });

  it('uses full pages when the limit is a multiple of the batch size', () => {
    expect(planPages(60, 20).map((p) => p.take)).toEqual([20, 20, 20]);
  });

  it('asks for exactly the limit when it is below the batch size', () => {
    expect(planPages(7, 20)).toEqual([{ page: 1, perPage: 7, take: 7 }]);
  });
});

describe('isPastLastPage', () => {
  it('recognises the WordPress error for a page beyond the last', () => {
    expect(isPastLastPage(400, { code: 'rest_post_invalid_page_number' })).toBe(
      true,
    );
  });

  it('does not hide other errors', () => {
    expect(isPastLastPage(400, { code: 'rest_invalid_param' })).toBe(false);
    expect(isPastLastPage(500, null)).toBe(false);
  });
});
