import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts/posts-schema';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blogs/db/blogs-schema';
import { User, UserDocument } from '../users/users-schema';

@Injectable()
export class DeleteAllRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async deleteAllBlogs(): Promise<boolean> {
    const result = await this.blogModel.deleteMany({});
    return result !== null;
  }
  async deleteAllPosts(): Promise<boolean> {
    const result = await this.postModel.deleteMany({});
    return result !== null;
  }
  async deleteAllUsers(): Promise<boolean> {
    const result = await this.userModel.deleteMany({});
    return result !== null;
  }
}

// n
