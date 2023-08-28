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
}
