import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users-repositories/users.repository';

import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';
import { BanUserByBlogerInputModel } from '../../../input-models/ban-user-by-bloger.dto';
import { BlogsRepository } from '../../../../blogs/repositories/blogs.repository';

export class BanUserByBloggerCommand {
  constructor(
    public userId: string,
    public inputModel: BanUserByBlogerInputModel,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BanUserByBloggerCommand)
export class BanUserByBloggerUseCase
  implements ICommandHandler<BanUserByBloggerCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: BanUserByBloggerCommand): Promise<ExceptionCodesType> {
    const isBlogExist = await this.blogsRepository.checkIsBlogExist(
      command.inputModel.blogId,
    );

    if (!isBlogExist) {
      return { code: ResultCode.NotFound };
    }

    const isBloggerOwner = await this.blogsRepository.checkIsUserOwnBlog(
      command.inputModel.blogId,
      command.currentUserId,
    );

    if (!isBloggerOwner) {
      return { code: ResultCode.Forbidden };
    }

    const isUserExist = await this.usersRepository.findUserLogin(
      command.userId,
    );
    if (!isUserExist) {
      return { code: ResultCode.NotFound };
    }

    const updateBlogInfo = await this.blogsRepository.updateUsersWereBannedInfo(
      command.userId,
      command.inputModel,
    );

    if (!updateBlogInfo) {
      return { code: ResultCode.NotFound };
    }

    return { code: ResultCode.Success };
  }
}
