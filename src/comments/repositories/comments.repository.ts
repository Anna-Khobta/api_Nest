import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments-schema';
import {
  CommentDBType,
  countBannedEngagement,
  LikeStatusesEnum,
  UserLikeInfo,
} from '../../types/types';
import { UsersRepository } from '../../users/users-repositories/users.repository';

export class CommentsRepository {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async saveComment(
    commentInstance: HydratedDocument<CommentDBType>,
  ): Promise<boolean> {
    try {
      await commentInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async findCommentById(id: string): Promise<CommentDBType | null> {
    const foundCommentById = await this.commentModel
      .findOne({ _id: id })
      .lean();

    return foundCommentById || null;
  }

  async findCommentatorIdByCommentId(
    commentId: string,
  ): Promise<string | null> {
    try {
      const foundCommentById = await this.commentModel.findById(commentId);
      return foundCommentById.commentatorInfo.userId;
    } catch (err) {
      return null;
    }
  }

  async updateComment(id: string, content: string): Promise<string | null> {
    const commentInstance = await this.commentModel.findOne({ _id: id });

    if (!commentInstance) {
      return null;
    }

    commentInstance.content = content;

    try {
      await commentInstance.save();
      return commentInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      await this.commentModel.findOneAndDelete({ _id: id });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async deleteAllComments(): Promise<number> {
    const result = await this.commentModel.deleteMany({});
    return result.deletedCount;
  }

  async updateLikesCountInComment(
    commentId: string,
    likes: number,
    dislikes: number,
  ): Promise<boolean> {
    const commentInstance = await this.commentModel.findOne({
      _id: commentId,
    });

    if (!commentInstance) {
      return false;
    }

    commentInstance.likesCount = likes;
    commentInstance.dislikesCount = dislikes;

    try {
      await commentInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addUserLikeInfoInDb(
    commentId: string,
    userLikeInfo: UserLikeInfo,
    likeStatus: LikeStatusesEnum,
  ): Promise<boolean> {
    const userLikeInfoToAdd: UserLikeInfo = {
      userId: userLikeInfo.userId,
      createdAt: userLikeInfo.createdAt,
      userStatus: likeStatus,
    };

    const commentInstance = await this.commentModel.findOne({
      _id: commentId,
    });

    if (!commentInstance) {
      return false;
    }

    commentInstance.usersEngagement.push(userLikeInfoToAdd);

    try {
      await commentInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteUserInfo(
    commentId: string,
    userLikeInfo: UserLikeInfo,
    likeStatus: LikeStatusesEnum,
  ): Promise<boolean> {
    try {
      const commentInstance = await this.commentModel.findOne({
        _id: commentId,
      });

      if (!commentInstance) {
        return false;
      }

      commentInstance.usersEngagement = commentInstance.usersEngagement.filter(
        (user) => user.userId !== userLikeInfo.userId,
      );
      await commentInstance.save();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async countingLikesDislikesOnCommentMinusBanned(
    commentId: string,
  ): Promise<countBannedEngagement> {
    const bannedUserIds = await this.usersRepository.getAllBannedUsersIds();

    const comment = await this.commentModel.findById(
      { _id: commentId },
      { __v: 0 },
    );

    const commentEngagementUsersLikedAndBanned = await this.commentModel.find(
      {
        _id: commentId,
        usersEngagement: {
          $elemMatch: {
            userId: { $in: bannedUserIds },
            userStatus: LikeStatusesEnum.Like,
          },
        },
      },
      { usersEngagement: 1 },
    );

    const commentEngagementUsersDislikedAndBanned =
      await this.commentModel.find(
        {
          _id: commentId,
          usersEngagement: {
            $elemMatch: {
              userId: { $in: bannedUserIds },
              userStatus: LikeStatusesEnum.Dislike,
            },
          },
        },
        { usersEngagement: 1 },
      );

    const minusLikes = commentEngagementUsersLikedAndBanned.length;
    const minusDislikes = commentEngagementUsersDislikedAndBanned.length;

    const likesCountWithBanned = comment.likesCount - minusLikes;
    const dislikesCountWithBanned = comment.dislikesCount - minusDislikes;

    return {
      likesCountWithBanned: likesCountWithBanned,
      dislikesCountWithBanned: dislikesCountWithBanned,
    };
  }
}
