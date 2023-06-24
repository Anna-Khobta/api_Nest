import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { CommentDBType } from '../../types/types';
import { PostsRepository } from '../repositories/posts.repository';
import {
  ExceptionCodesType,
  ResultCode,
  SuccesCodeType,
} from '../../functions/exception-handler';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { UsersService } from '../../users/users.service';

export class CreateCommentForPostCommand {
  constructor(
    public currentUserId: string,
    public postId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
  implements ICommandHandler<CreateCommentForPostCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected userService: UsersService,
  ) {}

  async execute(
    command: CreateCommentForPostCommand,
  ): Promise<ExceptionCodesType | SuccesCodeType> {
    const blogId = await this.postsRepository.foundBlogId(command.postId);
    if (!blogId) {
      return { code: ResultCode.NotFound };
    }

    const isBlogWasBanned = await this.blogsRepository.checkIsBlogBanned(
      blogId,
    );
    if (isBlogWasBanned) {
      return { code: ResultCode.NotFound };
    }

    const isOwnerWasBanned = await this.userService.isBlogOrPostOwnerBanned(
      blogId,
    );
    if (isOwnerWasBanned) {
      return { code: ResultCode.NotFound };
    }

    const isCurrentUserWasBannedInBlog =
      await this.blogsRepository.checkIsUserWasBannedInThisBlog(
        blogId,
        command.currentUserId,
      );
    if (isCurrentUserWasBannedInBlog) {
      return { code: ResultCode.Forbidden };
    }

    const newCommentId = await this.createComment(
      command.postId,
      command.content,
      command.currentUserId,
    );

    return { data: newCommentId, code: ResultCode.Success };
  }

  private async createComment(
    postId: string,
    content: string,
    userId: string,
  ): Promise<string> {
    const userLogin = await this.usersRepository.findUserLogin(userId);

    const commentatorInfo = {
      userId: userId,
      userLogin: userLogin,
    };

    const newComment: CommentDBType = {
      postId: postId,
      content: content,
      createdAt: new Date().toISOString(),
      commentatorInfo: commentatorInfo,
      likesCount: 0,
      dislikesCount: 0,
      usersEngagement: [],
    };

    const newCommentId = await this.commentsRepository.saveAndCreateComment(
      newComment,
    );

    return newCommentId; //this._mapCommentFromDBToViewType(commentInstance);
  }
}
