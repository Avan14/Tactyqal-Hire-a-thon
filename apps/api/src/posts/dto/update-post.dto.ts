import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { OptionalNotNull, Trim } from '../../common/validation';
import { PostStatus } from '../../generated/prisma/enums';
import { CreatePostDto, SLUG_PATTERN } from './create-post.dto';

/**
 * Every field optional. Omitted fields are left unchanged; the slug never
 * changes implicitly.
 *
 * Optional fields may be sent as null to clear them: authorSlug removes the
 * author, excerpt is regenerated from the content, and the SEO and image
 * fields are emptied. Required fields reject null.
 */
export class UpdatePostDto extends PartialType(
  OmitType(CreatePostDto, ['title', 'slug', 'contentHtml', 'status'] as const),
) {
  @OptionalNotNull()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @OptionalNotNull()
  @IsString()
  @MaxLength(80)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase words joined by hyphens',
  })
  slug?: string;

  @OptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  contentHtml?: string;

  @OptionalNotNull()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
