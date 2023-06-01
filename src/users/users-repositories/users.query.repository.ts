import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users-schema';
import {
  UserDbType,
  UserInfoForEmail,
  UsersWithPagination,
  UserViewType,
  UserWithMongoId,
} from '../../blogs/types';
import { Post, PostDocument } from '../../posts/posts-schema';
import { getUsersPagination } from '../users-pagination';
import { QueryPaginationInputModelClass } from '../../blogs/db/blogs-input-classes';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) protected postModel: Model<PostDocument>,
  ) {}

  async findUserByLoginOrEmail(
    login: string | null,
    email: string | null,
  ): Promise<UserWithMongoId | null> {
    try {
      const foundUser = await this.userModel
        .findOne({
          $or: [{ 'accountData.login': login }, { 'accountData.email': email }],
        })
        .lean();

      return foundUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserById(userId: string): Promise<UserViewType | null> {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }

  async findUserByCode(code: string): Promise<UserDbType | null> {
    const foundUser = await this.userModel
      .findOne({
        'emailConfirmation.confirmationCode': code,
      })
      .lean();

    if (!foundUser) {
      return null;
    } else {
      return foundUser;
    }
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserWithMongoId | null> {
    const foundUser = await this.userModel
      .findOne({
        'passwordRecovery.recoveryCode': recoveryCode,
      })
      .lean();

    if (!foundUser) {
      return null;
    } else {
      return foundUser;
    }
  }

  async findUsers(
    queryPagination: QueryPaginationInputModelClass,
  ): Promise<UsersWithPagination> {
    const myPagination = getUsersPagination(queryPagination);

    const searchLoginTerm = myPagination.searchLoginTerm;
    const searchEmailTerm = myPagination.searchEmailTerm;

    let filter = {};

    if (searchLoginTerm || searchEmailTerm) {
      filter = {
        $or: [
          {
            'accountData.login': {
              $regex: searchLoginTerm,
              $options: 'i',
            },
          },
          {
            'accountData.email': {
              $regex: searchEmailTerm,
              $options: 'i',
            },
          },
        ],
      };
    }

    const findUsers = await this.userModel
      .find(filter, { __v: 0 })
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .lean();

    const items: UserViewType[] = findUsers.map((user) => ({
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    }));

    const total = await this.userModel.countDocuments(filter);
    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: items,
    };
  }

  async findUserInfoForEmailSend(
    userId: string,
  ): Promise<UserInfoForEmail | null> {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.accountData.email,
      confirmationCode: user.emailConfirmation.confirmationCode,
    };
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<UserWithMongoId | null> {
    const foundUser = await this.userModel.findOne(
      { 'emailConfirmation.confirmationCode': code },
      { __v: 0 },
    );

    return foundUser || null;
  }
}
