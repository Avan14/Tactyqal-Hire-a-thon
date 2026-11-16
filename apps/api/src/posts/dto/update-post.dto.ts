import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

/** Every field optional. Omitted fields are left unchanged; the slug never changes implicitly. */
export class UpdatePostDto extends PartialType(CreatePostDto) {}
