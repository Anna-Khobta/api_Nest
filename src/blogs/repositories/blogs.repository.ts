import { Model } from 'mongoose';
import { Blog, BlogDocument, UsersWereBanned } from '../db/blogs-schema';
import { InjectModel } from '@nestjs/mongoose';
import { BlogClassDbType } from '../db/blogs-class';
import { BanUserByBlogerInputModel } from '../../users/input-models/ban-user-by-bloger.dto';
import { BlogViewType } from '../../types/types';
import { UsersRepository } from '../../users/users-repositories/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    protected usersRepository: UsersRepository,
  ) {}
  async save(blogInstance: BlogDocument): Promise<boolean> {
    try {
      await blogInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async saveAndCreate(
    newBlog: BlogClassDbType,
    userId: string,
    userLogin: string,
  ): Promise<string | null> {
    try {
      const blogInstance: BlogDocument = new this.blogModel(newBlog);
      blogInstance.blogOwnerInfo.userId = userId;
      blogInstance.blogOwnerInfo.userLogin = userLogin;

      await blogInstance.save();
      return blogInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result = await this.blogModel.updateOne(
      { _id: id },
      {
        $set: { name: name, description: description, websiteUrl: websiteUrl },
      },
    );
    return result.matchedCount === 1;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.blogModel.findOneAndDelete({ _id: id });
    return result !== null;
  }

  async updateBlogOwnerInfo(
    blogId: string,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    try {
      const blog = await this.blogModel.findOne({ _id: blogId });
      blog.blogOwnerInfo.userId = userId;
      blog.blogOwnerInfo.userLogin = userLogin;

      await blog.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkIsUserOwnBlog(blogId: string, userId: string): Promise<boolean> {
    try {
      const blog = await this.blogModel.findOne({
        $and: [{ _id: blogId }, { 'blogOwnerInfo.userId': userId }],
      });

      if (!blog) {
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async checkIsBlogExist(blogId: string): Promise<boolean> {
    try {
      const blog = await this.blogModel.findById(blogId).lean();
      if (blog) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async checkIsBlogBanned(blogId: string): Promise<boolean> {
    try {
      const blog = await this.blogModel.findById(blogId).lean();

      if (blog.banInfo.isBanned === true) {
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  async foundBlogName(blogId: string): Promise<string | null> {
    try {
      const blog = await this.blogModel.findById(blogId).lean();
      if (blog) {
        return blog.name;
      } else {
        return null;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async findBlogOwnerUserByBlogId(blogId: string): Promise<string | null> {
    const foundBlogName = await this.blogModel
      .findOne({ _id: blogId }, { _id: 0 })
      .lean();
    return foundBlogName.blogOwnerInfo.userId || null;
  }

  async updateBanInfo(blogId: string, isBanned: boolean): Promise<boolean> {
    try {
      const blog = await this.blogModel.findOne({ _id: blogId });
      if (!blogId) {
        return false;
      }

      if (blog.banInfo.isBanned === isBanned) {
        return true;
      }
      if (isBanned === false) {
        blog.banInfo.isBanned = isBanned;
        blog.banInfo.banDate = null;
      } else {
        blog.banInfo.isBanned = isBanned;
        blog.banInfo.banDate = new Date();
      }

      await blog.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async updateUsersWereBannedInfo(
    userId: string,
    inputModel: BanUserByBlogerInputModel,
  ): Promise<boolean> {
    try {
      const foundLogin = await this.usersRepository.findUserLogin(userId);

      const userBannedToAdd: UsersWereBanned = {
        userId: userId,
        login: foundLogin,
        isBanned: inputModel.isBanned,
        banReason: inputModel.banReason,
        banDate: new Date(),
      };

      const blog = await this.blogModel.findOne({ _id: inputModel.blogId });

      if (!blog) {
        return false;
      }

      // проверяем есть ли в БД
      const checkIfUserInBannedGroup = blog.usersWereBanned.find(
        (user) => user.userId === userId,
      );

      /*if (!checkIfUserInBannedGroup) {
        if (inputModel.isBanned === true) {
          blog.usersWereBanned.push(userBannedToAdd);
        }
      }*/

      if (!checkIfUserInBannedGroup && inputModel.isBanned === true) {
        // add in db
        blog.usersWereBanned.push(userBannedToAdd);
      }

      if (checkIfUserInBannedGroup?.isBanned === inputModel.isBanned) {
        return true;
      }

      // разбаненых удаляем из БД
      if (checkIfUserInBannedGroup && inputModel.isBanned === false) {
        const sortedUser = blog.usersWereBanned.filter(
          (user) => user.userId !== userId,
        );
        blog.usersWereBanned = sortedUser;
      }

      await blog.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async findBlogName(blogId: string): Promise<BlogViewType | null> {
    const foundBlogName: BlogViewType | null = await this.blogModel
      .findOne({ _id: blogId }, { _id: 0 })
      .lean();
    return foundBlogName || null;
  }
  async checkIsUserWasBannedInThisBlog(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const blog = await this.blogModel.findOne({
        $and: [{ _id: blogId }, { 'usersWereBanned.userId': userId }],
      });

      if (!blog) {
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async findAllBlogsUserOwner(userId: string): Promise<any> {
    const findBlogs = await this.blogModel
      .find(
        {
          $and: [
            { 'banInfo.isBanned': false },
            { 'blogOwnerInfo.userId': userId },
          ],
        },
        { _id: 1, __v: 0 },
      )
      .lean();
    const blogIds = findBlogs.map((blog) => ({
      id: blog._id.toString(),
    }));
    console.log(blogIds);
    return blogIds;
  }
}
