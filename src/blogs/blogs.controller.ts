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
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { CustomException } from '../functions/custom-exception';
import { isValid } from '../functions/isValid-Id';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import {
  CreateBlogInputModelClass,
  QueryPaginationInputModelClass,
} from './db/blogs-input-classes';
import { CreatePostForSpecialBlogInputModel } from '../posts/post-input-model-class';
import { BasicAuthGuard } from '../auth-guards/basic-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { IfHaveUserJwtAccessGuard } from '../auth-guards/if.have.user.jwt-access.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() inputModel: CreateBlogInputModelClass) {
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
  async getAllBlogs(@Query() queryPagination: QueryPaginationInputModelClass) {
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() inputModel: CreateBlogInputModelClass,
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
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: CreatePostForSpecialBlogInputModel,
    @CurrentUserId() currentUserId: string,
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
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryPagination: QueryPaginationInputModelClass,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(blogId);
    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogId,
    );
    if (!blogById) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }

    //currentUserId
    const foundPosts = await this.postsQueryRepository.findPosts(
      blogId,
      queryPagination,
      currentUserId,
    );
    return foundPosts;
  }
}
