import { Model, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../comments-schema';
import { CommentViewType, LikeStatusesEnum } from '../../blogs/types';
import { QueryPaginationInputModelClass } from '../../blogs/db/blogs-input-classes';
import { getPagination } from '../../functions/pagination';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async findCommentsForPost(
    postId: string,
    page: number,
    limit: number,
    sortDirection: SortOrder,
    sortBy: string,
    skip: number,
  ) {
    const filter = { postId };

    const findComments = await this.commentModel
      .find({ postId: postId }, { __v: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortDirection })
      .lean();

    const mappedComments = findComments.map((comment) => {
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
          myStatus: 'None', // Set the default value for myStatus
        },
      };
    });

    const total = await this.commentModel.countDocuments(filter);
    const pagesCount = Math.ceil(total / limit);

    return {
      pagesCount: pagesCount,
      page: page,
      pageSize: limit,
      totalCount: total,
      items: mappedComments,
    };
  }

  async findCommentsForPostWithUser(
    postId: string,
    page: number,
    limit: number,
    sortDirection: SortOrder,
    sortBy: string,
    skip: number,
    userId: string,
  ) {
    const filter = { postId };

    const findComments = await this.commentModel
      .find({ postId: postId }, { __v: 0 })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
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
    const pagesCount = Math.ceil(total / limit);

    return {
      pagesCount: pagesCount,
      page: page,
      pageSize: limit,
      totalCount: total,
      items: mappedComments,
    };
  }

  async findCommentsForPostWithAndWithoutUser(
    postId: string,
    userId: string | undefined,
    queryPagination: QueryPaginationInputModelClass,
  ) {
    const myPagination = getPagination(queryPagination);
    const filter = { postId };

    const findComments = await this.commentModel
      .find({ postId: postId }, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    let mappedComments;
    if (userId) {
      mappedComments = findComments.map((comment) => {
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
    }

    mappedComments = findComments.map((comment) => {
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
          myStatus: 'None', // Set the default value for myStatus
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
