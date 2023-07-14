import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts-schema';
import { Injectable } from '@nestjs/common';
import {
  countBannedEngagement,
  LikeStatusesEnum,
  NewestLikesType,
  PostViewType,
  UserLikeInfo,
} from '../../types/types';
import { PostClassDbType } from '../posts-class';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query.repository';

@Injectable()
export class PostsRepository {
  constructor(
    protected usersRepository: UsersRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async createAndSave(newPost: PostClassDbType): Promise<string | null> {
    try {
      const postInstance = new this.postModel(newPost);
      await postInstance.save();
      return postInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updatePost(
    postId: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<string | null> {
    const postInstance = await this.postModel.findOne({ _id: postId });

    if (!postInstance) {
      return null;
    }

    //postInstance.updatePost()
    postInstance.title = title;
    postInstance.shortDescription = shortDescription;
    postInstance.content = content;

    try {
      await postInstance.save();
      return postInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.postModel.findOneAndDelete({ _id: id });
    return result !== null;
  }

  async createUserLikeInfoInDb(
    postId: string,
    userLikeInfo: UserLikeInfo,
    likeStatus: LikeStatusesEnum,
    likes: number,
    dislikes: number,
  ): Promise<boolean> {
    const userLikeInfoToAdd: UserLikeInfo = {
      userId: userLikeInfo.userId,
      createdAt: userLikeInfo.createdAt,
      userStatus: likeStatus,
    };

    if (likeStatus === LikeStatusesEnum.Like) {
      likes++;
    }

    if (likeStatus === LikeStatusesEnum.Dislike) {
      dislikes++;
    }

    try {
      const postInstance = await this.postModel.findOne({ _id: postId });
      if (!postInstance) {
        return false;
      }

      postInstance.likesCount = likes;
      postInstance.dislikesCount = dislikes;
      postInstance.usersEngagement.push(userLikeInfoToAdd);

      await postInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateUserLikeInfo(
    postId: string,
    userLikeInfo: UserLikeInfo,
    likeStatus: LikeStatusesEnum,
    likes: number,
    dislikes: number,
  ): Promise<boolean> {
    /* const userLikeInfoToAdd: UserLikeInfo = {
      userId: userLikeInfo.userId,
      createdAt: userLikeInfo.createdAt,
      userStatus: likeStatus,
    };*/

    try {
      const updateResult = await this.postModel.updateOne(
        {
          _id: postId,
          'usersEngagement.userId': userLikeInfo.userId,
        },
        {
          $set: {
            'usersEngagement.$.userStatus': likeStatus,
            likesCount: likes,
            dislikesCount: dislikes,
          },
        },
      );

      if (updateResult.matchedCount === 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async countingLikesDislikesOnPostMinusBanned(
    postId: string,
  ): Promise<countBannedEngagement> {
    const bannedUserIds = await this.usersRepository.getAllBannedUsersIds();

    const post = await this.postModel.findById({ _id: postId }, { __v: 0 });

    const postEngagementUsersLikedAndBanned = await this.postModel.find(
      {
        _id: postId,
        usersEngagement: {
          $elemMatch: {
            userId: { $in: bannedUserIds },
            userStatus: LikeStatusesEnum.Like,
          },
        },
      },
      { usersEngagement: 1 },
    );

    const postEngagementUsersDislikedAndBanned = await this.postModel.find(
      {
        _id: postId,
        usersEngagement: {
          $elemMatch: {
            userId: { $in: bannedUserIds },
            userStatus: LikeStatusesEnum.Dislike,
          },
        },
      },
      { usersEngagement: 1 },
    );

    const minusLikes = postEngagementUsersLikedAndBanned.length;
    const minusDislikes = postEngagementUsersDislikedAndBanned.length;

    const likesCountWithBanned = post.likesCount - minusLikes;
    const dislikesCountWithBanned = post.dislikesCount - minusDislikes;

    return {
      likesCountWithBanned: likesCountWithBanned,
      dislikesCountWithBanned: dislikesCountWithBanned,
    };
  }
  async foundBlogId(postId: string): Promise<null | string> {
    try {
      const foundPost = await this.postModel.findOne({ _id: postId });
      if (!foundPost) {
        return null;
      }
      return foundPost.blogId;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async findAllPostsUserOwner(blogIds: { id: string }[]): Promise<any> {
    const postsIds = [];
    for (let i = 0; i < blogIds.length; i++) {
      const foundPosts = await this.postModel.find({ blogId: blogIds[i].id });
      const ids = foundPosts.map((post) => post._id.toString());
      postsIds.push(...ids);
    }
    return postsIds;
  }

  async findPostByIdWhenAddToComments(
    createdId: string,
  ): Promise<PostViewType | null> {
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
            /*const foundLogins = await this.userModel.find(
              { _id: element.userId },
              { 'accountData.login': 1 },
            );*/
            const foundLogins = await this.usersRepository.findLogin(
              element.userId,
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
}
