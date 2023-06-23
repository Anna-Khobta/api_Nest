import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments-schema';
import {
  CommentDBType,
  countBannedEngagement,
  LikeStatusesEnum,
  UserLikeInfo,
} from '../../types/types';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { QueryPaginationInputModel } from '../../blogs/blogs-input-models/query-pagination-input-model.dto';
import { getPagination } from '../../functions/pagination';
import { PostsRepository } from '../../posts/repositories/posts.repository';

export class CommentsRepository {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async saveAndCreateComment(comment: any): Promise<string | null> {
    try {
      const commentInstance = new this.commentModel(comment);
      await commentInstance.save();
      return commentInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
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

    const commentEngagementUsersLikedAndBanned =
      await this.commentModel.aggregate([
        {
          $match: {
            usersEngagement: {
              $elemMatch: {
                userId: { $in: bannedUserIds },
                userStatus: 'Like',
              },
            },
          },
        },
        {
          $project: {
            userCount: {
              $size: {
                $filter: {
                  input: '$usersEngagement',
                  cond: {
                    $and: [
                      { $in: ['$$this.userId', bannedUserIds] },
                      { $eq: ['$$this.userStatus', 'Like'] },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

    const commentEngagementUsersDislikedAndBanned =
      await this.commentModel.aggregate([
        {
          $match: {
            usersEngagement: {
              $elemMatch: {
                userId: { $in: bannedUserIds },
                userStatus: LikeStatusesEnum.Dislike,
              },
            },
          },
        },
        {
          $project: {
            userCount: {
              $size: {
                $filter: {
                  input: '$usersEngagement',
                  cond: {
                    $and: [
                      { $in: ['$$this.userId', bannedUserIds] },
                      {
                        $eq: ['$$this.userStatus', LikeStatusesEnum.Dislike],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

    let minusLikes;
    if (!commentEngagementUsersLikedAndBanned[0]) {
      minusLikes = 0;
    } else {
      minusLikes = commentEngagementUsersLikedAndBanned[0].userCount;
    }

    let minusDislikes;
    if (!commentEngagementUsersDislikedAndBanned[0]) {
      minusDislikes = 0;
    } else {
      minusDislikes = commentEngagementUsersDislikedAndBanned[0].userCount;
    }

    const likesCountWithBanned = comment.likesCount - minusLikes;
    const dislikesCountWithBanned = comment.dislikesCount - minusDislikes;

    return {
      likesCountWithBanned: likesCountWithBanned,
      dislikesCountWithBanned: dislikesCountWithBanned,
    };
  }

  async findAllCommentsUserOwnerBlogs(
    postIds: string[],
    queryPagination: QueryPaginationInputModel,
    userId: string,
  ): Promise<any> {
    const myPagination = getPagination(queryPagination);

    const filterIds = [];
    let filter = {};
    for (let i = 0; i < postIds.length; i++) {
      const filter1 = { postId: postIds[i] };
      filterIds.push(filter1);
    }

    if (!filterIds[0]) {
      filter;
    } else {
      filter = { $or: filterIds };
    }

    const foundComments = await this.commentModel
      .find(filter)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .lean();

    const mappedComments = await Promise.all(
      foundComments.map(async (comment) => {
        const post = await this.postsRepository.findPostByIdWhenAddToComments(
          comment.postId,
        );

        const myStatus = comment.usersEngagement.find(
          (el) => el.userId === userId,
        );

        const countingCommentEngagementWithBannedUsers =
          await this.countingLikesDislikesOnCommentMinusBanned(
            comment._id.toString(),
          );

        return {
          id: comment._id.toString(),
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          likesInfo: {
            likesCount:
              countingCommentEngagementWithBannedUsers.likesCountWithBanned,
            dislikesCount:
              countingCommentEngagementWithBannedUsers.dislikesCountWithBanned,
            myStatus: myStatus?.userStatus || 'None',
          },
          createdAt: comment.createdAt,
          postInfo: {
            id: post.id,
            title: post.title,
            blogId: post.blogId,
            blogName: post.blogName,
          },
        };
      }),
    );

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
}

/* const comments = [];
    for (let i = 0; i < postIds.length; i++) {
      const foundComments = await this.commentModel.find({
        postId: postIds[i],
      });
      comments.push(foundComments);
    }*/
