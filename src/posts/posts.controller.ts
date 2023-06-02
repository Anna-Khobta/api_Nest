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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CustomException } from '../functions/custom-exception';
import { isValid } from '../functions/isValid-Id';
import { QueryPaginationInputModelClass } from '../blogs/db/blogs-input-classes';
import {
  CreateCommentInputModelClass,
  CreatePostInputModelClass,
} from './post-input-model-class';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { CommentsService } from '../comments/comments.service';
import { JwtRefreshGuard } from '../auth-guards/jwt-refresh.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsService: CommentsService,
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
    return await this.postsQueryRepository.findPosts(null, queryPagination);
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

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtRefreshGuard)
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() inputModel: CreateCommentInputModelClass,
    @CurrentUserId() currentUserId: string,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);

    if (!post) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }

    const newComment = await this.commentsService.createComment(
      postId,
      inputModel.content,
      currentUserId,
    );

    return newComment;
  }
}

/*  @Get(':postId/comments')
  @HttpCode(200)
  //@UseGuards(JwtRefreshGuard)
  async getCommentsForPost(
    @Param('postId') postId: string,
    //@CurrentUserId() currentUserId: string,
    @Query() queryPagination: QueryPaginationInputModelClass,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
  }
}*/
