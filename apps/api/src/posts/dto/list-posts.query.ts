import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PostStatus } from '../../generated/prisma/enums';
import { SLUG_PATTERN } from './create-post.dto';

export const MAX_PAGE_SIZE = 50;

export class ListPostsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = 10;

  /** Category slug. */
  @IsOptional()
  @Matches(SLUG_PATTERN)
  category?: string;

  /** Tag slug. */
  @IsOptional()
  @Matches(SLUG_PATTERN)
  tag?: string;

  /** Author slug. */
  @IsOptional()
  @Matches(SLUG_PATTERN)
  author?: string;

  /** Full-text search. Supports quoted phrases and -exclusions. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Admin only. Without it, admins see every status and the public sees published posts. */
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
