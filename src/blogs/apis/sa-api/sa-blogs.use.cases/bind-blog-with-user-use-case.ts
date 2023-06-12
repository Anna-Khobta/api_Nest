import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../../users/users-schema';
import { Model } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean | string> {
    const findLogin = await this.usersRepository.findUserLogin(command.userId);

    if (!findLogin) {
      return false;
    }

    const updateBlogOwner = await this.blogsRepository.updateBlogOwnerInfo(
      command.blogId,
      command.userId,
      findLogin,
    );

    return true;
  }
}
