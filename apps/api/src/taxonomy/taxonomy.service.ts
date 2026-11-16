import { Injectable } from '@nestjs/common';
import { PostStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

export interface TermWithCount {
  name: string;
  slug: string;
  postCount: number;
}

export interface AuthorWithCount extends TermWithCount {
  bio: string | null;
}

/** Counts only posts the public can see, so filters never lead to empty pages. */
function publishedPosts() {
  return {
    where: { status: PostStatus.PUBLISHED, publishedAt: { lte: new Date() } },
  };
}

function byCountThenName(a: TermWithCount, b: TermWithCount) {
  return b.postCount - a.postCount || a.name.localeCompare(b.name);
}

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  async categories(): Promise<TermWithCount[]> {
    const rows = await this.prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { posts: publishedPosts() } },
      },
    });
    return rows
      .map(({ name, slug, _count }) => ({
        name,
        slug,
        postCount: _count.posts,
      }))
      .sort(byCountThenName);
  }

  async tags(): Promise<TermWithCount[]> {
    const rows = await this.prisma.tag.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { posts: publishedPosts() } },
      },
    });
    return rows
      .map(({ name, slug, _count }) => ({
        name,
        slug,
        postCount: _count.posts,
      }))
      .sort(byCountThenName);
  }

  async authors(): Promise<AuthorWithCount[]> {
    const rows = await this.prisma.author.findMany({
      select: {
        name: true,
        slug: true,
        bio: true,
        _count: { select: { posts: publishedPosts() } },
      },
    });
    return rows
      .map(({ name, slug, bio, _count }) => ({
        name,
        slug,
        bio,
        postCount: _count.posts,
      }))
      .sort(byCountThenName);
  }
}
