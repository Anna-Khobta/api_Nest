import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts/posts-schema';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blogs/db/blogs-schema';
import { User, UserDocument } from '../users/users-schema';
import { Comment, CommentDocument } from '../comments/comments-schema';
import { DeviceDb, DeviceDocument } from '../devices/device-schema';
import { IpDb, IpDbDocument } from '../auth-guards/ip.limit/ip-limit-schema';

@Injectable()
export class DeleteAllRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(DeviceDb.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(IpDb.name) private ipDbModel: Model<IpDbDocument>,
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
  async deleteAllComments(): Promise<boolean> {
    const result = await this.commentModel.deleteMany({});
    return result !== null;
  }
  async deleteAllDevices(): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({});
    return result !== null;
  }
  async deleteAllIps(): Promise<boolean> {
    const result = await this.ipDbModel.deleteMany({});
    return result !== null;
  }
}
