import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { CustomException } from './functions/custom-exception';
import { isValid } from './functions/isValid-Id';
import { PostsService } from '../posts/posts.service';
import { CreatePostInputModelType } from '../posts/posts.controller';
import { PostsQueryRepository } from '../posts/posts.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModelType) {
    const blogIdIsCreated = await this.blogsService.createBlog(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );

    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogIdIsCreated,
    );
    return blogById;
  }

  @Get()
  async getAllBlogs(@Query() queryPagination: QueryPaginationType) {
    const foundBlogs = await this.blogsQueryRepository.findBlogs(
      queryPagination,
    );
    return foundBlogs;
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string) {
    isValid(blogId);
    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogId,
    );
    if (blogById) {
      return blogById;
    } else {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() inputModel: CreateBlogInputModelType,
  ) {
    isValid(blogId);
    const foundBlogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogId,
    );

    if (!foundBlogById) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const isUpdated = await this.blogsService.updateBlog(
      blogId,
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
    if (!isUpdated) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') blogId: string) {
    isValid(blogId);
    const isDeleted = await this.blogsService.deleteBlog(blogId);
    if (!isDeleted) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return;
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: CreatePostInputModelType,
  ) {
    isValid(blogId);

    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogId,
    );
    if (!blogById) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const createdPostId = await this.postsService.createPost(
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
      blogId,
    );

    if (!createdPostId) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const postView = await this.postsQueryRepository.findPostById(
      createdPostId,
    );
    return postView;
  }

  @Get(':blogId/posts')
  async getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryPagination: QueryPaginationType,
  ) {
    isValid(blogId);

    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogId,
    );
    if (!blogById) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const foundPosts = await this.postsQueryRepository.findPosts(
      blogId,
      queryPagination,
    );
    return foundPosts;
  }
}

/*

                const foundPostsWithoutUser = await postQueryRepository.findPosts(blogId, page, limit, sortDirection, sortBy, skip)
                res.status(200).send(foundPostsWithoutUser)

            } else {

                const foundPostsWithUser = await postQueryRepository.findPostsWithUser(blogId, page, limit, sortDirection, sortBy, skip, userInfo.id)
                res.status(200).send(foundPostsWithUser)

            }

        })
    }*/

export type CreateBlogInputModelType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type QueryPaginationType = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
};
