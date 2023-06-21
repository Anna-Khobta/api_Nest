import { Model } from 'mongoose';
import {
  BannedUsersWithPagination,
  BlogsWithPagination,
  BlogViewType,
} from '../../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { getPagination } from '../../functions/pagination';
import { QueryPaginationInputModel } from '../blogs-input-models/query-pagination-input-model.dto';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { User, UserDocument } from '../../users/users-schema';

export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>, //protected usersRepository: UsersRepository,
  ) {}
  async findBlogs(
    queryPagination: QueryPaginationInputModel,
  ): Promise<BlogsWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = {};

    if (myPagination.searchNameTerm) {
      filter = {
        $and: [
          {
            'banInfo.isBanned': false,
          },
          {
            name: { $regex: myPagination.searchNameTerm, $options: 'i' },
          },
        ],
      };
    } else {
      filter = {
        'banInfo.isBanned': false,
      };
    }

    const findBlogs = await this.blogModel
      .find(filter, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const items: BlogViewType[] = findBlogs.map((blog) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }));

    const total = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(total / myPagination.limit);
    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: items,
    };
  }

  async findAllBlogsForBlogger(
    queryPagination: QueryPaginationInputModel,
    userId: string,
  ): Promise<BlogsWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = { 'blogOwnerInfo.userId': userId };

    if (myPagination.searchNameTerm) {
      filter = {
        $and: [
          { 'blogOwnerInfo.userId': userId },
          {
            name: { $regex: myPagination.searchNameTerm, $options: 'i' },
          },
        ],
      };
    }

    const findBlogs = await this.blogModel
      .find(filter, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const items: BlogViewType[] = findBlogs.map((blog) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }));

    const total = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(total / myPagination.limit);
    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: items,
    };
  }

  async findBlogsForSa(
    queryPagination: QueryPaginationInputModel,
  ): Promise<BlogsWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = {};
    if (myPagination.searchNameTerm) {
      filter = {
        name: { $regex: myPagination.searchNameTerm, $options: 'i' },
      };
    }

    const findBlogs = await this.blogModel
      .find(filter, { __v: 0 })
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const items: BlogViewType[] = findBlogs.map((blog) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.blogOwnerInfo.userId,
        userLogin: blog.blogOwnerInfo.userLogin,
      },
    }));

    const total = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(total / myPagination.limit);
    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: items,
    };
  }

  async findBlogByIdViewModel(blogId: string): Promise<BlogViewType | null> {
    try {
      const blog = await this.blogModel.findById(blogId).lean();
      if (blog) {
        return {
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: blog.isMembership,
        };
      } else {
        return null;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findAllBannedUsersForSpecialBlog(
    blogId: string,
    queryPagination: QueryPaginationInputModel,
    userId: string,
  ): Promise<BannedUsersWithPagination> {
    const myPagination = getPagination(queryPagination);

    let filter: any = {};

    filter = { _id: blogId };

    /* if (myPagination.searchLoginTerm) {
      filter = {
        $and: [
          { _id: blogId },
          {
            usersWereBanned: {
              $regex: myPagination.searchLoginTerm,
              $options: 'i',
            },
          },
        ],
      };
    } else {
      filter = { _id: blogId };
    }*/

    const blog = await this.blogModel
      .find(
        { _id: blogId },
        {
          'usersWereBanned.userId': 1,
          'usersWereBanned.isBanned': 1,
          'usersWereBanned.banReason': 1,
          'usersWereBanned.banDate': 1,
        },
      )
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ [myPagination.sortBy]: myPagination.sortDirection })
      .lean();

    const bannedUsers = blog[0].usersWereBanned;

    const items = await Promise.all(
      bannedUsers.map(async (user) => {
        const login = await this.findUserLogin(user.userId);
        return {
          id: user.userId,
          login: login,
          banInfo: {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason,
          },
        };
      }),
    );

    const total = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: bannedUsers.length,
      items: items,
    };
  }

  async findUserLogin(userId: string): Promise<string | null> {
    try {
      const foundUser = await this.userModel.findById(userId);
      return foundUser.accountData.login;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
