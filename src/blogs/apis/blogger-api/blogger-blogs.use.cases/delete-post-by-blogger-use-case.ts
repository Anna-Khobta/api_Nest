import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class DeletePostByBloggerCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostByBloggerCommand)
export class DeletePostByBloggerUseCase
  implements ICommandHandler<DeletePostByBloggerCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(
    command: DeletePostByBloggerCommand,
  ): Promise<boolean | ExceptionCodesType> {
    const isBlogExist = await this.blogsRepository.checkIsBlogExist(
      command.blogId,
    );

    if (!isBlogExist) {
      return { code: ResultCode.NotFound };
    }

    const isBloggerOwner = await this.blogsRepository.checkIsUserOwnBlog(
      command.blogId,
      command.userId,
    );

    if (!isBloggerOwner) {
      return { code: ResultCode.Forbidden };
    }

    const isDeleted = await this.postsRepository.deletePost(command.postId);

    if (!isDeleted) {
      return { code: ResultCode.NotFound };
    }

    return true;
  }
}
