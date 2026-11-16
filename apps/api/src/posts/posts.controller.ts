import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AdminAuthService, AdminTokenGuard } from '../common/admin-token.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQuery } from './dto/list-posts.query';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly auth: AdminAuthService,
  ) {}

  // Public reads come from the web server for every visitor, so a per-IP
  // limit would throttle the whole site. Writes stay rate limited.

  /** Published posts, newest first. Admins can also see drafts. */
  @Get()
  @SkipThrottle()
  list(@Query() query: ListPostsQuery, @Req() req: Request) {
    return this.posts.list(query, this.auth.isAdmin(req));
  }

  /** One post by slug, with its full HTML body. */
  @Get(':slug')
  @SkipThrottle()
  findOne(@Param('slug') slug: string, @Req() req: Request) {
    return this.posts.findBySlug(slug, this.auth.isAdmin(req));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminTokenGuard)
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminTokenGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.posts.remove(id);
  }
}
