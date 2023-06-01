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
import { CustomException } from '../functions/custom-exception';
import { isValid } from '../functions/isValid-Id';
import { QueryPaginationInputModelClass } from '../blogs/db/blogs-input-classes';
import { CreatePostInputModelClass } from './post-input-model-class';
@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  async createPost(@Body() inputModel: CreatePostInputModelClass) {
    const createdPostId = await this.postsService.createPost(
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
      inputModel.blogId,
    );

    if (!createdPostId) {
      throw new CustomException('Post cant be created', HttpStatus.NOT_FOUND);
    }
    return await this.postsQueryRepository.findPostById(createdPostId);
  }

  @Get()
  async getAllPosts(@Query() queryPagination: QueryPaginationInputModelClass) {
    const foundPosts = await this.postsQueryRepository.findPosts(
      null,
      queryPagination,
    );
    return foundPosts;
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    isValid(id);
    const findPostWithoutUserInfo =
      await this.postsQueryRepository.findPostByIdWithoutUser(id);

    if (!findPostWithoutUserInfo) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
    return findPostWithoutUserInfo;
  }

  @Put(':id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') postId: string,
    @Body() inputModel: CreatePostInputModelClass,
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
  @HttpCode(204)
  async deletePostById(@Param('id') postId: string) {
    isValid(postId);
    const isDeleted = await this.postsService.deletePost(postId);
    if (!isDeleted) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return;
  }
}
