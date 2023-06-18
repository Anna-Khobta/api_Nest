import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { InjectModel } from '@nestjs/mongoose';
import { BlogClassDbType } from '../db/blogs-class';

export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
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
}
