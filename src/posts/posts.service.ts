import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { PostClassDbType } from './posts-class';
import { PostsRepository } from './posts.repository';
import { PostsQueryRepository } from './posts.query.repository';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query.repository';

import { LikeStatusesEnum, PostViewType, UserLikeInfo } from '../types/types';
import { CreatePostInputModelClass } from './post-input-model-class';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsQueryRepository)
    protected postQueryRepository: PostsQueryRepository,
    @Inject(PostsRepository)
    protected postsDbRepository: PostsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    @InjectModel(Post.name) protected postModel: Model<PostDocument>,
  ) {}

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<string | null> {
    const foundBlogName = await this.blogsQueryRepository.findBlogName(blogId);

    if (!foundBlogName) {
      return null;
    }

    const newPost = new PostClassDbType(
      title,
      shortDescription,
      content,
      blogId,
      foundBlogName.name,
    );

    const postInstance = new this.postModel(newPost);
    await this.postsDbRepository.save(postInstance);

    return postInstance._id.toString();
  }
  async updatePost(
    postId: string,
    inputModel: CreatePostInputModelClass,
  ): Promise<string | null> {
    const foundPostId = await this.postQueryRepository.findPostById(postId);
    const foundBlogName = await this.blogsQueryRepository.findBlogName(
      inputModel.blogId,
    );

    if (!foundPostId || !foundBlogName) {
      return null;
    }

    const updatedPostId = await this.postsDbRepository.updatePost(
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
    return this.postsDbRepository.deletePost(id);
  }

  async deleteAllPosts(): Promise<number> {
    return this.postsDbRepository.deleteAllPosts();
  }

  async createLikeStatus(
    userId: string,
    foundPost: PostViewType,
    postId: string,
    likeStatus: LikeStatusesEnum,
  ): Promise<boolean> {
    const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null =
      await this.postQueryRepository.checkUserLike(postId, userId);

    const userLikeInfo: UserLikeInfo = {
      userId: userId,
      createdAt: new Date().toISOString(),
      userStatus: checkIfUserHaveAlreadyPutLike || likeStatus,
    };

    let likes = foundPost.extendedLikesInfo.likesCount;
    let dislikes = foundPost.extendedLikesInfo.dislikesCount;

    //если пользователь ранее не лайкал вообще этот пост
    if (!checkIfUserHaveAlreadyPutLike) {
      return await this.postsDbRepository.createUserLikeInfoInDb(
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

      return await this.postsDbRepository.updateUserLikeInfo(
        postId,
        userLikeInfo,
        likeStatus,
        likes,
        dislikes,
      );
    }
  }
}
