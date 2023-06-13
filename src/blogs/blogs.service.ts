import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './repositories/blogs.repository';
import { BlogClassDbType } from './db/blogs-class';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './db/blogs-schema';
@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async saCreateBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<string | null> {
    const newBlog = new BlogClassDbType(name, description, websiteUrl);

    const blogInstance: BlogDocument = new this.blogModel(newBlog);

    const result = await this.blogsRepository.save(blogInstance);

    return blogInstance._id.toString();
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    return await this.blogsRepository.updateBlog(
      id,
      name,
      description,
      websiteUrl,
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id);
  }
}
