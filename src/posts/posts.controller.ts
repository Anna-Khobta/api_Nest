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
import {
  CreateCommentInputModelClass,
  CreatePostInputModelClass,
  LikeStatusInputModel,
} from './post-input-model-class';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { CommentsService } from '../comments/comments.service';
import { IfHaveUserJwtAccessGuard } from '../auth-guards/if.have.user.jwt-access.guard';
import { CommentsQueryRepository } from '../comments/repositories/comments.query.repository';
import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import { BasicAuthGuard } from '../auth-guards/basic-auth.guard';
import { QueryPaginationInputModel } from '../blogs/blogs-input-models/query-pagination-input-model.dto';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getAllPosts(
    @Query() queryPagination: QueryPaginationInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const foundPosts = await this.postsQueryRepository.findPostsWithWithoutUser(
      null,
      queryPagination,
      currentUserId,
    );
    return foundPosts;
  }

  @Get(':id')
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getPostById(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    //isValid(id);
    const foundPost =
      await this.postsQueryRepository.findPostByIdWithWithoutUser(
        id,
        currentUserId,
      );

    if (!foundPost) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
    return foundPost;
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(JwtAccessGuard)
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
  @Get(':postId/comments')
  @HttpCode(200)
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getCommentsForPost(
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId: string,
    @Query() queryPagination: QueryPaginationInputModel,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }

    const foundCommentsWithUserId =
      await this.commentsQueryRepository.findCommentsForPostWithAndWithoutUser(
        postId,
        currentUserId,
        queryPagination,
      );

    return foundCommentsWithUserId;
  }
  @Put(':postId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAccessGuard)
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @Body() inputModel: LikeStatusInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(postId);
    const findPostById = await this.postsQueryRepository.findPostById(postId);

    if (!findPostById) {
      throw new CustomException('Post not found', HttpStatus.NOT_FOUND);
    }
    const updateLikeStatus = await this.postsService.createLikeStatus(
      currentUserId,
      findPostById,
      postId,
      inputModel.likeStatus,
    );

    if (!updateLikeStatus) {
      throw new CustomException(
        {
          errorsMessages: [
            {
              message: 'Cant update like status',
              field: 'like-status',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return;
  }
}
