import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { PostViewType } from '../../../../types/types';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { PostClassDbType } from '../../../../posts/posts-class';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import { PostsQueryRepository } from '../../../../posts/repositories/posts.query.repository';
import {
  ExceptionCodesType,
  ResultCode,
} from '../../../../functions/exception-handler';

export class CreatePostForSpecialBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(CreatePostForSpecialBlogCommand)
export class CreatePostForSpecialBlogUseCase
  implements ICommandHandler<CreatePostForSpecialBlogCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    protected postRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: CreatePostForSpecialBlogCommand,
  ): Promise<PostViewType | ExceptionCodesType> {
    const blogName = await this.blogsRepository.foundBlogName(command.blogId);

    if (!blogName) {
      return { code: ResultCode.NotFound };
    }

    const blogOwnerId = await this.blogsRepository.findBlogOwnerUserByBlogId(
      command.blogId,
    );

    if (!(blogOwnerId === command.userId)) {
      return { code: ResultCode.Forbidden };
    }

    return await this.bloggerCreatePost(
      command.title,
      command.shortDescription,
      command.content,
      blogName,
      command.blogId,
      command.userId,
    );
  }
  private async bloggerCreatePost(
    title: string,
    shortDescription: string,
    content: string,
    foundBlogName: string,
    blogId: string,
    userId: string,
  ): Promise<PostViewType> {
    const userLogin = await this.usersRepository.findUserLogin(userId);

    const newPost = new PostClassDbType(
      title,
      shortDescription,
      content,
      blogId,
      foundBlogName,
      userId,
      userLogin,
    );

    const newPostId = await this.postRepository.createAndSave(newPost);

    return await this.postsQueryRepository.findPostById(newPostId);
  }
}
