import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../comments-schema';
import { CommentViewType, LikeStatusesEnum } from '../../types/types';
import { getPagination } from '../../functions/pagination';
import { QueryPaginationInputModel } from '../../blogs/blogs-input-models/query-pagination-input-model.dto';
import { CommentsRepository } from './comments.repository';

export class CommentsQueryRepository {
  constructor(
    protected commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async findCommentsForPostWithAndWithoutUser(
    postId: string,
    userId: string | undefined,
    queryPagination: QueryPaginationInputModel,
  ) {
    const myPagination = getPagination(queryPagination);
    const filter = { postId };

    const findComments = await this.commentModel
      .find({ postId: postId }, { __v: 0 })
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .lean();

    const mappedComments = findComments.map((comment) => {
      const myStatus = comment.usersEngagement.find(
        (el) => el.userId === userId,
      );
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
          myStatus: myStatus?.userStatus || 'None',
        },
      };
    });

    const total = await this.commentModel.countDocuments(filter);
    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: mappedComments,
    };
  }

  async getCommentWithWithoutUser(commentId: string, userId: string | null) {
    const foundCommentById = await this.findCommentById(commentId);
    if (!foundCommentById) {
      return null;
    }

    if (!userId) {
      return foundCommentById;
    }

    const checkUserStatus = await this.checkUserLike(commentId, userId);

    if (!checkUserStatus) {
      return null;
    }

    const countingCommentEngagementWithBannedUsers =
      await this.commentsRepository.countingLikesDislikesOnCommentMinusBanned(
        commentId,
      );

    return {
      id: commentId,
      content: foundCommentById.content,
      commentatorInfo: {
        userId: foundCommentById.commentatorInfo.userId,
        userLogin: foundCommentById.commentatorInfo.userLogin,
      },
      createdAt: foundCommentById.createdAt,
      likesInfo: {
        likesCount:
          countingCommentEngagementWithBannedUsers.likesCountWithBanned,
        dislikesCount:
          countingCommentEngagementWithBannedUsers.dislikesCountWithBanned,
        myStatus: checkUserStatus.toString(),
      },
    };
  }

  async findCommentById(commentId: string): Promise<CommentViewType | null> {
    try {
      const foundComment = await this.commentModel.findById(commentId).lean();
      if (!foundComment) {
        return null;
      }

      return {
        id: commentId,
        content: foundComment.content,
        commentatorInfo: {
          userId: foundComment.commentatorInfo.userId,
          userLogin: foundComment.commentatorInfo.userLogin,
        },
        createdAt: foundComment.createdAt,
        likesInfo: {
          likesCount: foundComment.likesCount,
          dislikesCount: foundComment.dislikesCount,
          myStatus: LikeStatusesEnum.None,
        },
      };
    } catch (error) {
      return null;
    }
  }

  async checkUserLike(
    commentId: string,
    userId: string,
  ): Promise<LikeStatusesEnum | null> {
    try {
      const commentInstance = await this.commentModel.findById({
        _id: commentId,
      });

      const userLikeInfo = commentInstance!.usersEngagement.find(
        (user) => user.userId === userId,
      );

      if (!userLikeInfo) {
        return LikeStatusesEnum.None;
      } else {
        return userLikeInfo.userStatus;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
