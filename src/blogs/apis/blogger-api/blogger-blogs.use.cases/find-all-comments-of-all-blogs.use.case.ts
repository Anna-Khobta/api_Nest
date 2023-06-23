import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import {
  ExceptionCodesType,
  ResultCode,
  SuccesCodeType,
} from '../../../../functions/exception-handler';
import { QueryPaginationInputModel } from '../../../blogs-input-models/query-pagination-input-model.dto';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import { CommentsRepository } from '../../../../comments/repositories/comments.repository';

export class FindAllCommentsOfAllBlogsCommand {
  constructor(
    public userId: string,
    public pagination: QueryPaginationInputModel,
  ) {}
}

@CommandHandler(FindAllCommentsOfAllBlogsCommand)
export class FindAllCommentsOfAllBlogsUseCase
  implements ICommandHandler<FindAllCommentsOfAllBlogsCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: FindAllCommentsOfAllBlogsCommand,
  ): Promise<ExceptionCodesType | string | SuccesCodeType> {
    const foundAllBlogsIdsForUser =
      await this.blogsRepository.findAllBlogsUserOwner(command.userId);

    const foundAllPostIdsForUser =
      await this.postsRepository.findAllPostsUserOwner(foundAllBlogsIdsForUser);

    const foundAllCommentsForUsersBlogs =
      await this.commentsRepository.findAllCommentsUserOwnerBlogs(
        foundAllPostIdsForUser,
        command.pagination,
        command.userId,
      );

    return { data: foundAllCommentsForUsersBlogs, code: ResultCode.Success };
  }
}
