import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class UpdateExistingPostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateExistingPostForBlogCommand)
export class UpdateExistingPostForBlogUseCase
  implements ICommandHandler<UpdateExistingPostForBlogCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
    protected postRepository: PostsRepository,
  ) {}

  async execute(
    command: UpdateExistingPostForBlogCommand,
  ): Promise<string | ExceptionCodesType> {
    const blogById = await this.blogsRepository.checkIsBlogExist(
      command.blogId,
    );
    if (!blogById) {
      return { code: ResultCode.NotFound };
    }

    const blogOwnerId = await this.blogsRepository.findBlogOwnerUserByBlogId(
      command.blogId,
    );

    if (!(blogOwnerId === command.userId)) {
      return { code: ResultCode.Forbidden };
    }

    await this.postRepository.updatePost(
      command.postId,
      command.title,
      command.shortDescription,
      command.content,
    );

    return { code: ResultCode.Success };
  }
}
