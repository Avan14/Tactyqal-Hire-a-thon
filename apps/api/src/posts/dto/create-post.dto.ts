import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/validation';
import { PostStatus } from '../../generated/prisma/enums';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_OPTIONS = { protocols: ['http', 'https'], require_protocol: true };

export class CreatePostDto {
  /** Post title. */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  /** URL slug. Generated from the title when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase words joined by hyphens',
  })
  slug?: string;

  /** Short summary. Generated from the content when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  /** Post body as HTML. Sanitized against an allow-list before storage. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  contentHtml!: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  /** Publish time. Defaults to now when a post is published. A future time schedules it. */
  @IsOptional()
  @IsISO8601({ strict: true })
  publishedAt?: string;

  @IsOptional()
  @IsUrl(URL_OPTIONS)
  @MaxLength(2048)
  featuredImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsOptional()
  @IsUrl(URL_OPTIONS)
  @MaxLength(2048)
  canonicalUrl?: string;

  /** Slug of an existing author. */
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN)
  authorSlug?: string;

  /** Slugs of existing categories. Replaces the full set on update. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  categories?: string[];

  /** Slugs of existing tags. Replaces the full set on update. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];
}
