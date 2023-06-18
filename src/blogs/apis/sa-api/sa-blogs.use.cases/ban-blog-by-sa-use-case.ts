import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../../users/users-schema';
import { Model } from 'mongoose';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class BanBlogBySaCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogBySaCommand)
export class BanBlogBySaUseCase implements ICommandHandler<BanBlogBySaCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

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
