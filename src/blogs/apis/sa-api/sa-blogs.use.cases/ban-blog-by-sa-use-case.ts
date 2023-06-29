import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class BanBlogBySaCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogBySaCommand)
export class BanBlogBySaUseCase implements ICommandHandler<BanBlogBySaCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogBySaCommand): Promise<ExceptionCodesType> {
    const updateBlogInfo = await this.blogsRepository.updateBanInfo(
      command.blogId,
      command.isBanned,
    );

    if (!updateBlogInfo) {
      return { code: ResultCode.NotFound };
    }

    return { code: ResultCode.Success };
  }
}
