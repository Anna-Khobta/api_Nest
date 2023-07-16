import { PostClassDbType } from './posts-class';
import { PostsRepository } from './repositories/posts.repository';
import { PostsQueryRepository } from './repositories/posts.query.repository';
import { Injectable } from '@nestjs/common';
import { LikeStatusesEnum, PostViewType, UserLikeInfo } from '../types/types';
import { CreatePostInputModel } from './input-models/create-post-input-model.dto';
import { BlogsRepository } from '../blogs/repositories/blogs.repository';
import {
  ExceptionCodesType,
  ResultCode,
  SuccesCodeType,
} from '../functions/exception-handler';
import { UsersRepository } from '../users/users-repositories/users.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postQueryRepository: PostsQueryRepository,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<string | null> {
    const foundBlogName = await this.blogsRepository.findBlogName(blogId);

    if (!foundBlogName) {
      return null;
    }

    const newPost = new PostClassDbType(
      title,
      shortDescription,
      content,
      blogId,
      foundBlogName.name,
      null,
      null,
    );

    const newPostId = await this.postsRepository.createAndSave(newPost);

    return newPostId;
  }

  async updatePost(
    postId: string,
    inputModel: CreatePostInputModel,
  ): Promise<string | null> {
    const foundPostId = await this.postQueryRepository.findPostById(postId);
    const foundBlogName = await this.blogsRepository.findBlogName(
      inputModel.blogId,
    );

    if (!foundPostId || !foundBlogName) {
      return null;
    }

    const updatedPostId = await this.postsRepository.updatePost(
      postId,
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
    );

    if (!updatedPostId) {
      return null;
    }

    return updatedPostId;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }

  async createLikeStatus(
    userId: string,
    foundPost: PostViewType,
    postId: string,
    likeStatus: LikeStatusesEnum,
  ): Promise<boolean> {
    const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null =
      await this.postsRepository.checkUserLike(postId, userId);

    const userLikeInfo: UserLikeInfo = {
      userId: userId,
      createdAt: new Date().toISOString(),
      userStatus: checkIfUserHaveAlreadyPutLike || likeStatus,
    };

    let likes = foundPost.extendedLikesInfo.likesCount;
    let dislikes = foundPost.extendedLikesInfo.dislikesCount;

    //если пользователь ранее не лайкал вообще этот пост
    if (!checkIfUserHaveAlreadyPutLike) {
      return await this.postsRepository.createUserLikeInfoInDb(
        postId,
        userLikeInfo,
        likeStatus,
        likes,
        dislikes,
      );
    } else {
      if (checkIfUserHaveAlreadyPutLike === likeStatus) return true;

      if (checkIfUserHaveAlreadyPutLike === 'None') {
        switch (likeStatus) {
          case 'Like':
            likes++;
            break;
          case 'Dislike':
            dislikes++;
            break;
          default:
            break;
        }
      }

      if (checkIfUserHaveAlreadyPutLike === 'Like') {
        switch (likeStatus) {
          case 'Dislike':
            likes--;
            dislikes++;
            break;
          default:
            likes--;
            break;
        }
      }
      if (checkIfUserHaveAlreadyPutLike === 'Dislike') {
        switch (likeStatus) {
          case 'Like':
            likes++;
            dislikes--;
            break;
          default:
            dislikes--;
            break;
        }
      }

      return await this.postsRepository.updateUserLikeInfo(
        postId,
        userLikeInfo,
        likeStatus,
        likes,
        dislikes,
      );
    }
  }

  async checkIsBlogWasBannedBySa(postId: string): Promise<SuccesCodeType> {
    const foundBlogId = await this.postsRepository.foundBlogId(postId);
    if (!foundBlogId) {
      return { data: null, code: ResultCode.NotFound };
    }
    const checkBlogIsBanned = await this.blogsRepository.checkIsBlogBanned(
      foundBlogId,
    );

    if (!checkBlogIsBanned) {
      return { data: foundBlogId, code: ResultCode.Success };
    }
    return { data: null, code: ResultCode.NotFound };
  }

  async checkIsUserWasBanned(
    userId: string,
    blogId: string,
  ): Promise<ExceptionCodesType> {
    const isOwnerAlreadyBanned =
      await this.usersRepository.isBlogOrPostOwnerBanned(blogId);

    if (isOwnerAlreadyBanned) {
      return { code: ResultCode.NotFound };
    }
    return { code: ResultCode.Success };
  }
}
