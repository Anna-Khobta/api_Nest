import { Injectable } from '@nestjs/common';
import {
  CommentDBType,
  CommentViewType,
  LikeStatusesEnum,
  UserLikeInfo,
} from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { ObjectId } from 'mongodb';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsQueryRepository } from './repositories/comments.query.repository';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { UsersRepository } from '../users/users-repositories/users.repository';
export type CommentWithMongoId = CommentDBType & { _id: ObjectId };

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  _mapCommentFromDBToViewType(comment: CommentWithMongoId): CommentViewType {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: LikeStatusesEnum.None,
      },
    };
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const foundCommentById = await this.commentsRepository.findCommentById(id);

    if (!foundCommentById) {
      return false;
    }

    const updateComment = await this.commentsRepository.updateComment(
      id,
      content,
    );

    if (!updateComment) {
      return false;
    }

    return true;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.commentsRepository.deleteComment(id);
  }

  async deleteCommentIfOwn(
    commentId: string,
    userId: string,
  ): Promise<string | boolean> {
    const findCommentById = await this.commentsQueryRepository.findCommentById(
      commentId,
    );

    if (!findCommentById) {
      return 'NotFound';
    }

    const checkUserOwnComment = await this.checkUser(userId, commentId);
    if (!checkUserOwnComment) {
      return 'NotOwnComment';
    }
    const wasDeleted = await this.deleteComment(commentId);
    if (!wasDeleted) {
      return false;
    }
    return true;
  }

  async checkUser(
    userId: string,
    commentId: string,
  ): Promise<boolean | string> {
    const findUserLogin = await this.usersQueryRepository.findUserById(userId);

    if (!findUserLogin) {
      return false;
    }

    const commentatorInfo = {
      userId: userId,
      userLogin: findUserLogin.login,
    };

    const foundCommentOwner = await this.commentModel
      .findOne({
        _id: commentId,
      })
      .lean();

    if (!foundCommentOwner) {
      return 'NotFound';
    }

    if (foundCommentOwner) {
      if (
        foundCommentOwner.commentatorInfo.userId === commentatorInfo.userId &&
        foundCommentOwner.commentatorInfo.userLogin ===
          commentatorInfo.userLogin
      ) {
        return true;
      }
    }
  }

  async deleteAllComments(): Promise<number> {
    return this.commentsRepository.deleteAllComments();
  }

  async createLikeStatus(
    userId: string,
    comment: CommentViewType,
    commentId: string,
    likeStatus: LikeStatusesEnum,
  ): Promise<boolean> {
    // вернется статус пользователя в формате enam

    const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null =
      await this.commentsQueryRepository.checkUserLike(commentId, userId);

    if (!checkIfUserHaveAlreadyPutLike) {
      return false;
    }
    // если произошла ошибка в бд, вернется null

    let likes = comment.likesInfo.likesCount;
    let dislikes = comment.likesInfo.dislikesCount;

    const userLikeInfo: UserLikeInfo = {
      userId: userId,
      createdAt: new Date().toISOString(),
      userStatus: checkIfUserHaveAlreadyPutLike || LikeStatusesEnum.None,
    };
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
      await this.commentsRepository.addUserLikeInfoInDb(
        commentId,
        userLikeInfo,
        likeStatus,
      );
    }

    if (checkIfUserHaveAlreadyPutLike === 'Like') {
      switch (likeStatus) {
        case 'Dislike':
          likes--;
          dislikes++;
          await this.commentsRepository.deleteUserInfo(
            commentId,
            userLikeInfo,
            checkIfUserHaveAlreadyPutLike,
          );
          await this.commentsRepository.addUserLikeInfoInDb(
            commentId,
            userLikeInfo,
            likeStatus,
          );
          break;
        default:
          likes--;
          await this.commentsRepository.deleteUserInfo(
            commentId,
            userLikeInfo,
            checkIfUserHaveAlreadyPutLike,
          );
          break;
      }
    }

    if (checkIfUserHaveAlreadyPutLike === 'Dislike') {
      switch (likeStatus) {
        case 'Like':
          likes++;
          dislikes--;
          await this.commentsRepository.deleteUserInfo(
            commentId,
            userLikeInfo,
            checkIfUserHaveAlreadyPutLike,
          );
          await this.commentsRepository.addUserLikeInfoInDb(
            commentId,
            userLikeInfo,
            likeStatus,
          );
          break;
        default:
          dislikes--;
          await this.commentsRepository.deleteUserInfo(
            commentId,
            userLikeInfo,
            checkIfUserHaveAlreadyPutLike,
          );
          break;
      }
    }

    await this.commentsRepository.updateLikesCountInComment(
      commentId,
      likes,
      dislikes,
    );

    return true;
  }
  async updateCommentStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusesEnum,
  ): Promise<string | boolean> {
    const findCommentById = await this.commentsQueryRepository.findCommentById(
      commentId,
    );
    if (!findCommentById) {
      return 'NotFound';
    }
    const updateLikeStatus = await this.createLikeStatus(
      userId,
      findCommentById,
      commentId,
      likeStatus,
    );
    if (!updateLikeStatus) {
      return 'BadRequest';
    }
    return true;
  }

  async isCommentOwnerBanned(commentId: string): Promise<boolean> {
    const foundCommentatorId =
      await this.commentsRepository.findCommentatorIdByCommentId(commentId);

    if (!foundCommentatorId) {
      return false;
    }

    const isUserBanned = await this.usersRepository.isCurrentUserBanned(
      foundCommentatorId,
    );
    if (!isUserBanned) {
      return true;
      // если все ок, вернется тру
    }
    return false;
  }
}
