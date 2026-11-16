import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PostStatus } from '../generated/prisma/enums';
import { Paginated, pageMeta } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import {
  excerptFrom,
  readingMinutes,
  sanitizePostHtml,
  slugify,
  uniqueSlug,
} from './content';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQuery } from './dto/list-posts.query';
import { UpdatePostDto } from './dto/update-post.dto';

const taxonomySelect = {
  select: { name: true, slug: true },
  orderBy: { name: 'asc' },
} as const;

/** Fields returned in lists. The body is left out to keep list payloads small. */
const summarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  featuredImageUrl: true,
  status: true,
  publishedAt: true,
  readingMinutes: true,
  author: { select: { name: true, slug: true } },
  categories: taxonomySelect,
  tags: taxonomySelect,
} satisfies Prisma.PostSelect;

const detailSelect = {
  ...summarySelect,
  contentHtml: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

export type PostSummary = Prisma.PostGetPayload<{
  select: typeof summarySelect;
}>;
export type PostDetail = Prisma.PostGetPayload<{ select: typeof detailSelect }>;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListPostsQuery,
    isAdmin: boolean,
  ): Promise<Paginated<PostSummary>> {
    if (query.status && !isAdmin) {
      throw new UnauthorizedException(
        'Filtering by status requires the admin token',
      );
    }
    return query.q?.trim()
      ? this.search(query, isAdmin)
      : this.browse(query, isAdmin);
  }

  async findBySlug(slug: string, isAdmin: boolean): Promise<PostDetail> {
    const post = await this.prisma.post.findFirst({
      where: { slug, ...(isAdmin ? {} : publicVisibility()) },
      select: detailSelect,
    });
    if (!post) throw new NotFoundException(`No post found with slug "${slug}"`);
    return post;
  }

  async create(dto: CreatePostDto): Promise<PostDetail> {
    const contentHtml = sanitizePostHtml(dto.contentHtml);
    const status = dto.status ?? PostStatus.DRAFT;
    const slug =
      dto.slug ??
      (await uniqueSlug(slugify(dto.title), (s) => this.slugExists(s)));
    const relations = await this.resolveRelations(dto);

    return this.prisma.post.create({
      data: {
        slug,
        title: dto.title.trim(),
        excerpt: dto.excerpt?.trim() || excerptFrom(contentHtml),
        contentHtml,
        readingMinutes: readingMinutes(contentHtml),
        status,
        publishedAt:
          status === PostStatus.PUBLISHED
            ? dto.publishedAt
              ? new Date(dto.publishedAt)
              : new Date()
            : null,
        featuredImageUrl: dto.featuredImageUrl,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        author: relations.authorId
          ? { connect: { id: relations.authorId } }
          : undefined,
        categories: relations.categoryIds && { connect: relations.categoryIds },
        tags: relations.tagIds && { connect: relations.tagIds },
      },
      select: detailSelect,
    });
  }

  async update(id: string, dto: UpdatePostDto): Promise<PostDetail> {
    const existing = await this.prisma.post.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });
    if (!existing) throw new NotFoundException(`No post found with id "${id}"`);

    const data: Prisma.PostUpdateInput = {
      title: dto.title?.trim(),
      slug: dto.slug,
      excerpt: dto.excerpt?.trim(),
      featuredImageUrl: dto.featuredImageUrl,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      canonicalUrl: dto.canonicalUrl,
    };

    if (dto.contentHtml !== undefined) {
      data.contentHtml = sanitizePostHtml(dto.contentHtml);
      data.readingMinutes = readingMinutes(data.contentHtml);
    }

    const status = dto.status ?? existing.status;
    data.status = status;
    if (status === PostStatus.DRAFT) {
      data.publishedAt = null;
    } else if (dto.publishedAt) {
      data.publishedAt = new Date(dto.publishedAt);
    } else if (!existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const relations = await this.resolveRelations(dto);
    if (dto.authorSlug !== undefined) {
      data.author = { connect: { id: relations.authorId } };
    }
    if (relations.categoryIds) data.categories = { set: relations.categoryIds };
    if (relations.tagIds) data.tags = { set: relations.tagIds };

    return this.prisma.post.update({
      where: { id },
      data,
      select: detailSelect,
    });
  }

  async remove(id: string): Promise<void> {
    // A missing id raises Prisma P2025, which the exception filter maps to 404.
    await this.prisma.post.delete({ where: { id } });
  }

  private async browse(query: ListPostsQuery, isAdmin: boolean) {
    const where: Prisma.PostWhereInput = {
      ...visibility(query, isAdmin),
      ...(query.category && { categories: { some: { slug: query.category } } }),
      ...(query.tag && { tags: { some: { slug: query.tag } } }),
      ...(query.author && { author: { slug: query.author } }),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        select: summarySelect,
        orderBy: [
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return { data, meta: pageMeta(query.page, query.limit, total) };
  }

  /**
   * Full-text search ranks in SQL against the weighted search_vector
   * (title > excerpt > body), then loads the page of posts through Prisma.
   */
  private async search(query: ListPostsQuery, isAdmin: boolean) {
    const tsQuery = Prisma.sql`websearch_to_tsquery('english', ${query.q!.trim()})`;
    const conditions: Prisma.Sql[] = [
      Prisma.sql`p.search_vector @@ ${tsQuery}`,
    ];

    if (!isAdmin) {
      conditions.push(
        Prisma.sql`p.status = 'PUBLISHED' AND p.published_at <= now()`,
      );
    } else if (query.status) {
      conditions.push(Prisma.sql`p.status = ${query.status}::"PostStatus"`);
    }
    if (query.category) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM "_CategoryToPost" cp JOIN categories c ON c.id = cp."A"
        WHERE cp."B" = p.id AND c.slug = ${query.category})`);
    }
    if (query.tag) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM "_PostToTag" pt JOIN tags t ON t.id = pt."B"
        WHERE pt."A" = p.id AND t.slug = ${query.tag})`);
    }
    if (query.author) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM authors a WHERE a.id = p.author_id AND a.slug = ${query.author})`);
    }
    const where = Prisma.join(conditions, ' AND ');

    const [countRows, idRows] = await Promise.all([
      this.prisma.$queryRaw<{ count: number }[]>`
        SELECT count(*)::int AS count FROM posts p WHERE ${where}`,
      this.prisma.$queryRaw<{ id: string }[]>`
        SELECT p.id FROM posts p WHERE ${where}
        ORDER BY ts_rank(p.search_vector, ${tsQuery}) DESC, p.published_at DESC NULLS LAST
        LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`,
    ]);

    const ids = idRows.map((r) => r.id);
    const posts = await this.prisma.post.findMany({
      where: { id: { in: ids } },
      select: summarySelect,
    });
    const byId = new Map(posts.map((p) => [p.id, p]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((p): p is PostSummary => !!p);

    return {
      data,
      meta: pageMeta(query.page, query.limit, countRows[0]?.count ?? 0),
    };
  }

  private async slugExists(slug: string) {
    return (await this.prisma.post.count({ where: { slug } })) > 0;
  }

  /** Turns slugs into ids, failing with 400 and the unknown slugs listed. */
  private async resolveRelations(dto: UpdatePostDto) {
    const [author, categoryIds, tagIds] = await Promise.all([
      dto.authorSlug
        ? this.prisma.author.findUnique({
            where: { slug: dto.authorSlug },
            select: { id: true },
          })
        : null,
      dto.categories &&
        this.lookup('categories', dto.categories, (slugs) =>
          this.prisma.category.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true },
          }),
        ),
      dto.tags &&
        this.lookup('tags', dto.tags, (slugs) =>
          this.prisma.tag.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true },
          }),
        ),
    ]);
    if (dto.authorSlug && !author) {
      throw new BadRequestException(`Unknown author: ${dto.authorSlug}`);
    }
    return { authorId: author?.id, categoryIds, tagIds };
  }

  private async lookup(
    label: string,
    slugs: string[],
    find: (slugs: string[]) => Promise<{ id: string; slug: string }[]>,
  ): Promise<{ id: string }[]> {
    const unique = [...new Set(slugs)];
    const found = await find(unique);
    const missing = unique.filter((s) => !found.some((f) => f.slug === s));
    if (missing.length) {
      throw new BadRequestException(`Unknown ${label}: ${missing.join(', ')}`);
    }
    return found.map(({ id }) => ({ id }));
  }
}

function publicVisibility(): Prisma.PostWhereInput {
  return { status: PostStatus.PUBLISHED, publishedAt: { lte: new Date() } };
}

function visibility(
  query: ListPostsQuery,
  isAdmin: boolean,
): Prisma.PostWhereInput {
  if (!isAdmin) return publicVisibility();
  return query.status ? { status: query.status } : {};
}
