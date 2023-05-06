/*
import { LikeStatusesEnum, NewestLikesType } from '../types';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../posts/posts-schema';
import { User, UserDocument } from '../../users/users-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Last3UsersLikesRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findLikes(postId: string) {
    const postWithLikes = await this.postModel
      .find(
        { _id: postId, 'usersEngagement.userStatus': LikeStatusesEnum.Like },
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
*/
