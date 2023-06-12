import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsRepository } from '../../repositories/blogs.repository';
import { Blog, BlogDocument } from '../../db/blogs-schema';
import { UsersRepository } from '../../../users/users-repositories/users.repository';
@Injectable()
export class BloggerBlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  /*async bloggerCreateBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ): Promise<string | null> {
    const userLogin = await this.usersRepository.findUserLogin(userId);

    const newBlog = new BlogClassDbType(name, description, websiteUrl);

    const blogInstance: BlogDocument = new this.blogModel(newBlog);

    blogInstance.blogOwnerInfo.userId = userId;
    blogInstance.blogOwnerInfo.userLogin = userLogin;

    const result = await this.blogsRepository.save(blogInstance);

    return blogInstance._id.toString();
  }*/

  /*async updateBlog(
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
  }*/

  /*  async deleteBlog(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id);
  }*/
}
