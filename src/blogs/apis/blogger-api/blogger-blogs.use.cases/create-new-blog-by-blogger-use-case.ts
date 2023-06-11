import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogClassDbType } from '../../../db/blogs-class';
import { BlogDocument } from '../../../db/blogs-schema';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { BlogViewType } from '../../../../types/types';

export class CreateNewBlogByBloggerCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateNewBlogByBloggerCommand)
export class CreateNewBlogByBloggerUseCase
  implements ICommandHandler<CreateNewBlogByBloggerCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: CreateNewBlogByBloggerCommand): Promise<BlogViewType> {
    const blogIdIsCreated = await bloggerCreateBlog(
      command.name,
      command.description,
      command.websiteUrl,
      command.userId,
    );

    return await this.blogsQueryRepository.findBlogByIdViewModel(
      blogIdIsCreated,
    );
  }
}

export async function bloggerCreateBlog(
  name: string,
  description: string,
  websiteUrl: string,
  userId: string,
): Promise<string | null> {
  const userLogin = await this.usersRepository.findUserLogin(userId);

  const newBlog = new BlogClassDbType(name, description, websiteUrl);

  const blogInstance: BlogDocument = new this.blogModel(newBlog);

  blogInstance.blogOwnerInfo.userId = userId;
  blogInstance.blogOwnerInfo.userLogin = userLogin;

  await this.blogsRepository.save(blogInstance);

  return blogInstance._id.toString();
}
