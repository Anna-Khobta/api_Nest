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
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { CustomException } from '../functions/custom-exception';
import { isValid } from '../functions/isValid-Id';
import { LikeStatusInputModel } from './input-models/like-status-input-model.dto';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { IfHaveUserJwtAccessGuard } from '../auth-guards/if.have.user.jwt-access.guard';
import { CommentsQueryRepository } from '../comments/repositories/comments.query.repository';
import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import { BasicAuthGuard } from '../auth-guards/basic-auth.guard';
import { QueryPaginationInputModel } from '../blogs/blogs-input-models/query-pagination-input-model.dto';
import { CreatePostInputModel } from './input-models/create-post-input-model.dto';
import { CreateCommentInputModelDto } from '../comments/input-models/create-comment-input-model.dto';
import { exceptionHandler, ResultCode } from '../functions/exception-handler';
import { CreateCommentForPostCommand } from './posts.use.cases/create-comment-for-post.use.case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() inputModel: CreatePostInputModel) {
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
    @Param('id') postId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(postId);

    const checkIsBlogBanned = await this.postsService.checkIsBlogWasBannedBySa(
      postId,
    );

    if (checkIsBlogBanned.code !== ResultCode.Success) {
      return exceptionHandler(checkIsBlogBanned.code);
    }

    const checkIfUserOwnerBanned = await this.postsService.checkIsUserWasBanned(
      currentUserId,
      checkIsBlogBanned.data,
    );

    if (checkIfUserOwnerBanned.code !== ResultCode.Success) {
      return exceptionHandler(checkIfUserOwnerBanned.code);
    }

    const foundPost =
      await this.postsQueryRepository.findPostByIdWithWithoutUser(
        postId,
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
    @Body() inputModel: CreatePostInputModel,
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
    @Body() inputModel: CreateCommentInputModelDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const newCommentId = await this.commandBus.execute(
      new CreateCommentForPostCommand(
        currentUserId,
        postId,
        inputModel.content,
      ),
    );

    if (newCommentId.code !== ResultCode.Success) {
      return exceptionHandler(newCommentId.code);
    }

    return await this.commentsQueryRepository.findCommentById(
      newCommentId.data,
    );
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
