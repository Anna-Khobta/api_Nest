import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { PostViewType } from '../../../../types/types';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { PostClassDbType } from '../../../../posts/posts-class';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import { PostsQueryRepository } from '../../../../posts/repositories/posts.query.repository';

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
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
    protected postRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: CreatePostForSpecialBlogCommand,
  ): Promise<PostViewType | string> {
    const isBloggerOwner = await this.blogsRepository.checkIsUserOwnBlog(
      command.blogId,
      command.userId,
    );

    if (!isBloggerOwner) {
      return 'NotOwner';
    }
    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      command.blogId,
    );
    if (!blogById) {
      return 'NotFound';
    }

    const foundBlogName = blogById.name;

    return await this.bloggerCreatePost(
      command.title,
      command.shortDescription,
      command.content,
      foundBlogName,
      command.blogId,
      command.userId,
    );
  }
  async bloggerCreatePost(
    title: string,
    shortDescription: string,
    content: string,
    foundBlogName: string,
    blogId: string,
    userId: string,
  ): Promise<string | PostViewType> {
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
