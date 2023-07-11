import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts-schema';
import {
  LikeStatusesEnum,
  PostsWithPagination,
  PostViewType,
} from '../../types/types';
import { User, UserDocument } from '../../users/users-schema';
import { getPagination } from '../../functions/pagination';
import { QueryPaginationInputModel } from '../../blogs/blogs-input-models/query-pagination-input-model.dto';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query.repository';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async findPosts(
    blogId: string | null,
    queryPagination: QueryPaginationInputModel,
    userId: string | null,
  ): Promise<PostsWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = {};
    if (blogId) {
      filter = { blogId: blogId };
    }

    const foundPosts = await this.postModel
      .find(filter, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const mappedPosts = await Promise.all(
      foundPosts.map(async (post) => {
        const likers = await this.postsRepository.last3UsersLikes(
          post._id.toString(),
        );

        const countingWithBanned =
          await this.postsRepository.countingLikesDislikesOnPostMinusBanned(
            post._id.toString(),
          );

        const myStatus = post.usersEngagement.find(
          (el) => el.userId === userId,
        );

        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: countingWithBanned.likesCountWithBanned,
            dislikesCount: countingWithBanned.dislikesCountWithBanned,
            myStatus: myStatus?.userStatus || LikeStatusesEnum.None,
            newestLikes: likers,
          },
        };
      }),
    );

    const total = await this.postModel.countDocuments(filter);
    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: mappedPosts,
    };
  }

  async findPostsWithWithoutUser(
    blogId: string | null,
    queryPagination: QueryPaginationInputModel,
    userId: string | null,
  ): Promise<PostsWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = {};
    if (blogId) {
      filter = { blogId: blogId };
    }

    const foundPosts = await this.postModel
      .find(filter, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const mappedPosts = await Promise.all(
      foundPosts.map(async (post) => {
        const likers = await this.postsRepository.last3UsersLikes(
          post._id.toString(),
        );

        const countingWithBanned =
          await this.postsRepository.countingLikesDislikesOnPostMinusBanned(
            post._id.toString(),
          );

        let myStatus;
        if (userId) {
          const foundUserStatus = post.usersEngagement.find(
            (el) => el.userId === userId,
          );
          if (foundUserStatus) {
            myStatus = foundUserStatus.userStatus;
          } else {
            myStatus = LikeStatusesEnum.None;
          }
        }

        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: countingWithBanned.likesCountWithBanned,
            dislikesCount: countingWithBanned.dislikesCountWithBanned,
            myStatus: myStatus,
            newestLikes: likers,
          },
        };
      }),
    );

    const total = await this.postModel.countDocuments(filter);
    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: mappedPosts,
    };
  }

  async findPostById(createdId: string): Promise<PostViewType | null> {
    try {
      const post = await this.postModel.findById(createdId).lean();

      if (!post) {
        return null;
      }

      const likers = await this.postsRepository.last3UsersLikes(
        post._id.toString(),
      );

      const postView = {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesCount,
          dislikesCount: post.dislikesCount,
          myStatus: LikeStatusesEnum.None,
          newestLikes: likers,
        },
      };

      return postView;
    } catch (error) {
      return null;
    }
  }

  async findPostByIdWithWithoutUser(
    postId: string,
    userId: string | null,
  ): Promise<PostViewType | null | string> {
    const postInstance = await this.postModel.findById(
      { _id: postId },
      { __v: 0 },
    );

    if (!postInstance) {
      return null;
    }

    // find my like status
    let myStatus;

    const userLikeInfo = postInstance.usersEngagement.find(
      (user) => user.userId === userId,
    );

    if (!userLikeInfo) {
      myStatus = LikeStatusesEnum.None;
    } else {
      myStatus = userLikeInfo.userStatus;
    }

    // ------ WORK WITH BANNED USERS -----

    const countingWithBanned =
      await this.postsRepository.countingLikesDislikesOnPostMinusBanned(postId);

    const likers = await this.postsRepository.last3UsersLikes(postId);

    const postView = {
      id: postId,
      title: postInstance.title,
      shortDescription: postInstance.shortDescription,
      content: postInstance.content,
      blogId: postInstance.blogId,
      blogName: postInstance.blogName,
      createdAt: postInstance.createdAt,
      extendedLikesInfo: {
        likesCount: countingWithBanned.likesCountWithBanned,
        dislikesCount: countingWithBanned.dislikesCountWithBanned,
        myStatus: myStatus,
        newestLikes: likers,
      },
    };
    return postView;
  }
}
