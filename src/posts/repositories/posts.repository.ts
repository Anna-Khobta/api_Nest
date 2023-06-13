import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts-schema';
import { Injectable } from '@nestjs/common';
import {
  countBannedEngagement,
  LikeStatusesEnum,
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

  async save(postInstance: PostDocument): Promise<boolean> {
    try {
      await postInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

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

  async deleteAllPosts(): Promise<number> {
    const result = await this.postModel.deleteMany({});
    return result.deletedCount;
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
}
