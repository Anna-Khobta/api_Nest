import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

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
  ): Promise<ExceptionCodesType | string> {
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

    const isDeleted = await this.blogsRepository.deleteBlog(command.blogId);

    if (!isDeleted) {
      return { code: ResultCode.NotFound };
    }
    return { code: ResultCode.Success };
  }
}
