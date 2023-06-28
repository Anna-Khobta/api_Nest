import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users-schema';
import {
  UsersWithPagination,
  UserViewType,
  UserWithMongoId,
} from '../../types/types';
import { getUsersPagination } from '../users-pagination';
import { QueryPaginationInputModel } from '../../blogs/blogs-input-models/query-pagination-input-model.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserByLoginOrEmail(
    login: string | null,
    email: string | null,
  ): Promise<UserWithMongoId | null> {
    try {
      return await this.userModel
        .findOne({
          $or: [{ 'accountData.login': login }, { 'accountData.email': email }],
        })
        .lean();
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
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }

  async findUsers(
    queryPagination: QueryPaginationInputModel,
  ): Promise<UsersWithPagination> {
    const myPagination = getUsersPagination(queryPagination);

    const searchLoginTerm = myPagination.searchLoginTerm;
    const searchEmailTerm = myPagination.searchEmailTerm;
    const isBanned = myPagination.banStatus;

    let filter = {};

    if (typeof isBanned === 'boolean') {
      if (searchLoginTerm || searchEmailTerm) {
        filter = {
          $and: [
            {
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
            },
            {
              'banInfo.isBanned': isBanned,
            },
          ],
        };
      }
    }
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

    if (isBanned === true || isBanned === false) {
      filter = {
        'banInfo.isBanned': isBanned,
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
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
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
}
