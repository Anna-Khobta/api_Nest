import { Model } from 'mongoose';
import {
  BlogsWithPagination,
  BlogViewType,
  BlogViewWithOwnerAndBannedInfoType,
} from '../../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { getPagination } from '../../functions/pagination';
import { QueryPaginationInputModel } from '../blogs-input-models/query-pagination-input-model.dto';
import { getPaginationBanUsers } from '../../functions/pagination-ban-users';
import { ObjectId } from 'mongodb';

export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
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

    const items: BlogViewWithOwnerAndBannedInfoType[] = findBlogs.map(
      (blog) => ({
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
        banInfo: {
          isBanned: blog.banInfo.isBanned,
          banDate: blog.banInfo.banDate,
        },
      }),
    );

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
  ): Promise<any> {
    const myPagination = getPaginationBanUsers(queryPagination);

    const blogIdMongo = new ObjectId(blogId);

    let filter: any = {};
    let bannedUsers = [];
    let bannedUsersArrayMapped = [];

    if (myPagination.searchLoginTerm) {
      bannedUsers = await this.blogModel.aggregate([
        { $match: { _id: blogIdMongo } },
        { $project: { _id: 0, usersWereBanned: 1 } },
        { $unwind: '$usersWereBanned' },
        // Match documents based on the searchLoginTerm using regex with case-insensitivity
        {
          $match: {
            'usersWereBanned.login': {
              $regex: myPagination.searchLoginTerm,
              $options: 'i',
            },
          },
        },
        // Sort the usersWereBanned documents by login in ascending order
        { $sort: { [myPagination.sortBy]: myPagination.sortDirection } },
        // Group the documents back into an array
        {
          $group: {
            _id: null,
            usersWereBanned: { $push: '$usersWereBanned' },
          },
        },
      ]);

      if (bannedUsers.length > 0) {
        bannedUsersArrayMapped = bannedUsers[0].usersWereBanned.map((user) => ({
          id: user.userId,
          login: user.login,
          banInfo: {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason,
          },
        }));
      }
    } else {
      bannedUsers = await this.blogModel.aggregate([
        { $match: { _id: blogIdMongo } },
        {
          $project: {
            _id: 0,
            usersWereBanned: 1,
            result: {
              $sortArray: {
                input: '$usersWereBanned',
                sortBy: { [myPagination.sortBy]: myPagination.sortDirection },
              },
            },
          },
        },
      ]);

      bannedUsersArrayMapped = bannedUsers[0].result.map((user) => ({
        id: user.userId,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      }));
    }

    if (myPagination.searchLoginTerm) {
      filter = {
        $and: [
          { _id: blogId },
          {
            'usersWereBanned.login': {
              $regex: myPagination.searchLoginTerm,
              $options: 'i',
            },
          },
        ],
      };
    } else {
      filter = { _id: blogId };
    }

    const paginatedUsersWereBanned = bannedUsersArrayMapped.slice(
      myPagination.skip,
      myPagination.skip + myPagination.limit,
    );

    const allBannedUsers = await this.blogModel.find(filter, {
      usersWereBanned: 1,
      _id: 0,
    });

    const total = allBannedUsers[0]?.usersWereBanned?.length;

    const pagesCount = Math.ceil(total / myPagination.limit);

    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: paginatedUsersWereBanned,
    };
  }
}
