import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';

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
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean | string> {
    const findLogin = await this.usersRepository.findUserLogin(command.userId);

    if (!findLogin) {
      return false;
    }

    return await this.blogsRepository.updateBlogOwnerInfo(
      command.blogId,
      command.userId,
      findLogin,
    );
  }
}
