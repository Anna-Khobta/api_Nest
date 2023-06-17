import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class UpdateBlogByBloggerCommand {
  constructor(
    public blogId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateBlogByBloggerCommand)
export class UpdateBlogByBloggerUseCase
  implements ICommandHandler<UpdateBlogByBloggerCommand>
{
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(
    command: UpdateBlogByBloggerCommand,
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

    const isUpdated = await this.updateBlog(
      command.blogId,
      command.name,
      command.description,
      command.websiteUrl,
    );

    if (!isUpdated) {
      return { code: ResultCode.NotFound };
    }
    return { code: ResultCode.Success };
  }

  private async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    return await this.blogsRepository.updateBlog(
      id,
      name,
      description,
      websiteUrl,
    );
  }
}
