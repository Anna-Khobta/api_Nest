import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments-schema';
import {
  CommentDBType,
  LikeStatusesEnum,
  UserLikeInfo,
} from '../../blogs/types';

export class CommentsRepository {
  constructor(
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
      const result = await this.commentModel.findOneAndDelete({ _id: id });
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
}
