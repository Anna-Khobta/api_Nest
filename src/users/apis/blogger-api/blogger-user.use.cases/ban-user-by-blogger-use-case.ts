import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../../users/users-schema';
import { Model } from 'mongoose';
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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: BanUserByBloggerCommand): Promise<ExceptionCodesType> {
    const isBloggerOwner = await this.blogsRepository.checkIsUserOwnBlog(
      command.inputModel.blogId,
      command.userId,
    );

    if (!isBloggerOwner) {
      return { code: ResultCode.Forbidden };
    }

    const updateBlogInfo = await this.blogsRepository.updateUsersWerBannedInfo(
      command.userId,
      command.inputModel,
    );

    if (!updateBlogInfo) {
      return { code: ResultCode.NotFound };
    }

    return { code: ResultCode.Success };
  }
}
