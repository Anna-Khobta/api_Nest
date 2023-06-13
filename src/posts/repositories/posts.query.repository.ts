import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts-schema';
import {
  LikeStatusesEnum,
  NewestLikesType,
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
        const likers = await this.last3UsersLikes(post._id.toString());

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
        const likers = await this.last3UsersLikes(post._id.toString());

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

      const likers = await this.last3UsersLikes(post._id.toString());

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

    // check if post owner was banned
    const isOwnerAlreadyBanned =
      await this.usersRepository.isBlogOrPostOwnerBanned(postInstance.blogId);

    if (isOwnerAlreadyBanned) {
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

    const likers = await this.last3UsersLikes(postId);

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

  async checkUserLike(
    postId: string,
    userId: string,
  ): Promise<LikeStatusesEnum | null> {
    try {
      const postInstance = await this.postModel.findOne({ _id: postId });

      if (!postInstance) {
        return null;
      }

      const userLikeInfo = postInstance.usersEngagement.find(
        (user) => user.userId === userId,
      );

      if (!userLikeInfo) {
        return null;
      }
      return userLikeInfo.userStatus;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async last3UsersLikes(postId: string) {
    const bannedUserIds = await this.usersRepository.getAllBannedUsersIds();

    const postWithLikes = await this.postModel
      .find(
        {
          $and: [
            { _id: postId },
            {
              usersEngagement: {
                $not: {
                  $elemMatch: {
                    userId: { $in: bannedUserIds },
                  },
                },
              },
            },
            { 'usersEngagement.userStatus': LikeStatusesEnum.Like },
          ],
        },
        { _id: 0, __v: 0 },
      )
      .sort({ 'usersEngagement.createdAt': 'asc' })
      .lean();

    let mappedLikes: NewestLikesType[] = [];

    if (postWithLikes.length > 0) {
      if (postWithLikes[0].usersEngagement.length > 0) {
        const filteredLikes = postWithLikes[0].usersEngagement.filter(
          (user) => user.userStatus === 'Like',
        );
        const last3Likes = filteredLikes.slice(-3);
        const reverse = last3Likes.reverse();

        mappedLikes = await Promise.all(
          reverse.map(async (element) => {
            const foundLogins = await this.userModel.find(
              { _id: element.userId },
              { 'accountData.login': 1 },
            );

            return {
              addedAt: element.createdAt,
              userId: element.userId,
              login: foundLogins[0]?.accountData?.login,
            };
          }),
        );
      }
      return mappedLikes;
    } else {
      return mappedLikes;
    }
  }
}
