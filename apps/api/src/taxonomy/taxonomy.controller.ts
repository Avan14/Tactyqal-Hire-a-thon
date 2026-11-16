import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { TaxonomyService } from './taxonomy.service';

@ApiTags('taxonomy')
// Public, cache-friendly reads made server-side for every visitor: not throttled.
@SkipThrottle()
@Controller()
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  /** All categories with their published post counts, most used first. */
  @Get('categories')
  categories() {
    return this.taxonomy.categories();
  }

  /** All tags with their published post counts, most used first. */
  @Get('tags')
  tags() {
    return this.taxonomy.tags();
  }

  /** All authors with bios and published post counts. */
  @Get('authors')
  authors() {
    return this.taxonomy.authors();
  }
}
