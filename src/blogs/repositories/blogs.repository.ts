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
}