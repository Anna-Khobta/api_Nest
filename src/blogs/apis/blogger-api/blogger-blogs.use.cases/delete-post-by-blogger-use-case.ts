import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { BlogViewType } from '../../../../types/types';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';

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
  ): Promise<BlogViewType | string> {
    const isBlogExist = await this.blogsQueryRepository.findBlogByIdViewModel(
      command.blogId,
    );

    if (!isBlogExist) {
      return 'NotFound';
    }

    const isBloggerOwner = await this.blogsRepository.checkIsUserOwnBlog(
      command.blogId,
      command.userId,
    );

    if (!isBloggerOwner) {
      return 'NotOwner';
    }

    const isDeleted = await this.postsRepository.deletePost(command.postId);

    if (!isDeleted) {
      return 'NotFound';
    }
    return;
  }
}
