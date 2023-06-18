import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogClassDbType } from '../../../db/blogs-class';
import { Blog, BlogDocument } from '../../../db/blogs-schema';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { BlogViewType } from '../../../../types/types';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class CreateBlogByBloggerCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateBlogByBloggerCommand)
export class CreateBlogByBloggerUseCase
  implements ICommandHandler<CreateBlogByBloggerCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async execute(
    command: CreateBlogByBloggerCommand,
  ): Promise<BlogViewType | string> {
    const blogIdIsCreated = await this.bloggerCreateBlog(
      command.name,
      command.description,
      command.websiteUrl,
      command.userId,
    );

    return await this.blogsQueryRepository.findBlogByIdViewModel(
      blogIdIsCreated,
    );
  }
  private async bloggerCreateBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ): Promise<string | null> {
    const userLogin = await this.usersRepository.findUserLogin(userId);

    const newBlog = new BlogClassDbType(name, description, websiteUrl);

    return await this.blogsRepository.saveAndCreate(newBlog, userId, userLogin);
  }
}
