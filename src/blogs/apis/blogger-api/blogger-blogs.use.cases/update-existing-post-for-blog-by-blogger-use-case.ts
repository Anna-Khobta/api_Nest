import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogs.query.repository';
import { PostViewType } from '../../../../types/types';
import { UsersRepository } from '../../../../users/users-repositories/users.repository';
import { PostsRepository } from '../../../../posts/repositories/posts.repository';
import { PostsQueryRepository } from '../../../../posts/repositories/posts.query.repository';

export class UpdateExistingPostForBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateExistingPostForBlogCommand)
export class UpdateExistingPostForBlogUseCase
  implements ICommandHandler<UpdateExistingPostForBlogCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
    protected postRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: UpdateExistingPostForBlogCommand,
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

    return await this.postRepository.updatePost(
      command.postId,
      command.title,
      command.shortDescription,
      command.content,
    );
  }
}
