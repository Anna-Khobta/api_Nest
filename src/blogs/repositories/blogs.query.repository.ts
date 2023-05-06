import { Model } from 'mongoose';
import { BlogsWithPagination, BlogViewType } from '../types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../db/blogs-schema';
import { getPagination } from '../functions/pagination';
import { QueryPaginationType } from '../blogs.controller';

export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async findBlogs(
    queryPagination: QueryPaginationType,
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

  async findBlogByIdViewModel(blogId: string): Promise<BlogViewType | null> {
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
  }

  async findBlogName(blogId: string): Promise<BlogViewType | null> {
    const foundBlogName: BlogViewType | null = await this.blogModel
      .findOne({ _id: blogId }, { _id: 0 })
      .lean();
    return foundBlogName || null;
  }
}
