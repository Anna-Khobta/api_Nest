import { Model } from 'mongoose';
import { BlogsWithPagination, BlogViewType } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { getPagination } from './pagination';
import { QueryPaginationType } from './blogs.controller';

export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async findBlogs(
    queryPagination: QueryPaginationType,
  ): Promise<BlogsWithPagination> {
    const myPagination = getPagination(queryPagination);

    const findBlogs: BlogViewType[] = await this.blogModel
      .find(
        { name: { $regex: myPagination.searchNameTerm, $options: 'i' } },
        { projection: { _id: 0 } },
      )
      .skip(myPagination.skip)
      .limit(myPagination.limit)
      .sort({ sortBy: myPagination.sortDirection })
      .lean();

    const total = await this.blogModel.countDocuments({
      name: { $regex: myPagination.searchNameTerm, $options: 'i' },
    });
    const pagesCount = Math.ceil(total / myPagination.limit);
    return {
      pagesCount: pagesCount,
      page: myPagination.page,
      pageSize: myPagination.limit,
      totalCount: total,
      items: findBlogs,
    };
  }

  async findBlogById(blogId: string): Promise<BlogViewType | null> {
    const blog: BlogViewType | null = await this.blogModel
      .findOne({ id: blogId }, { projection: { _id: 0 } })
      .lean();

    if (blog) {
      return blog;
    } else {
      return null;
    }
  }

  async findBlogByIdViewModel(blogId: string): Promise<BlogViewType | null> {
    const blog = await this.blogModel.findOne({ _id: blogId }).lean();

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
      .findOne({ id: blogId }, { _id: 0 })
      .lean();
    return foundBlogName || null;
  }
}
