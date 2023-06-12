import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { InjectModel } from '@nestjs/mongoose';

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
}
