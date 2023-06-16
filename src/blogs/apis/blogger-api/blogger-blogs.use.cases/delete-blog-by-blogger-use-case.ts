import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogViewType } from '../../../../types/types';

export class DeleteBlogByBloggerCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(DeleteBlogByBloggerCommand)
export class DeleteBlogByBloggerUseCase
  implements ICommandHandler<DeleteBlogByBloggerCommand>
{
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(
    command: DeleteBlogByBloggerCommand,
  ): Promise<BlogViewType | string> {
    const isBlogExist = await this.blogsRepository.checkIsBlogExist(
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

    const isDeleted = await this.blogsRepository.deleteBlog(command.blogId);

    if (!isDeleted) {
      return 'NotFound';
    }
    return;
  }
}
