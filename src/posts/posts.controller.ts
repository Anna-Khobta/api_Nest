import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CustomException } from '../blogs/functions/custom-exception';
import { isValid } from '../blogs/functions/isValid-Id';
import { QueryPaginationType } from '../blogs/blogs.controller';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepositories: PostsQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  async createPost(@Body() inputModel: CreatePostInputModelType) {
    const createdPostId = await this.postsService.createPost(
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
      inputModel.blogId,
    );

    if (!createdPostId) {
      throw new CustomException('Post cant be created', HttpStatus.NOT_FOUND);
    }

    return await this.postsQueryRepositories.findPostById(createdPostId);
  }

  @Get()
  async getAllPosts(@Query() queryPagination: QueryPaginationType) {
    const foundPosts = await this.postsQueryRepositories.findPosts(
      null,
      queryPagination,
    );
    return foundPosts;
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    console.log(id, 'id ');
    isValid(id);
    const findPostWithoutUserInfo =
      await this.postsQueryRepositories.findPostByIdWithoutUser(id);

    console.log(findPostWithoutUserInfo, 'findPostWithoutUserInfo');

    if (!findPostWithoutUserInfo) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
    return findPostWithoutUserInfo;
  }

  @Put(':id')
  async updatePostById(
    @Param('id') postId: string,
    @Body() inputModel: CreatePostInputModelType,
  ) {
    isValid(postId);
    const updatedPostId = await this.postsService.updatePost(
      postId,
      inputModel,
    );
    if (!updatedPostId) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
    return;
  }

  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    isValid(postId);
    const isDeleted = await this.postsService.deletePost(postId);
    if (!isDeleted) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return;
  }
}

export type CreatePostInputModelType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
