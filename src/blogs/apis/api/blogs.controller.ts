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
import { BlogsService } from '../../blogs.service';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { CustomException } from '../../../functions/custom-exception';
import { isValid } from '../../../functions/isValid-Id';
import { PostsQueryRepository } from '../../../posts/repositories/posts.query.repository';
import { CreateBlogInputModel } from '../../blogs-input-models/create-blog-input-model.dto';
import { BasicAuthGuard } from '../../../auth-guards/basic-auth.guard';
import { CurrentUserId } from '../../../decorators/current-user-id.param.decorator';
import { IfHaveUserJwtAccessGuard } from '../../../auth-guards/if.have.user.jwt-access.guard';
import { QueryPaginationInputModel } from '../../blogs-input-models/query-pagination-input-model.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() inputModel: CreateBlogInputModel) {
    const blogIdIsCreated = await this.blogsService.saCreateBlog(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );

    return await this.blogsQueryRepository.findBlogByIdViewModel(
      blogIdIsCreated,
    );
  }

  @Get()
  async getAllBlogs(@Query() queryPagination: QueryPaginationInputModel) {
    return await this.blogsQueryRepository.findBlogs(queryPagination);
  }

  @Get('/:id')
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
    @Body() inputModel: CreateBlogInputModel,
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

  @Get(':blogId/posts')
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryPagination: QueryPaginationInputModel,
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
    return await this.postsQueryRepository.findPosts(
      blogId,
      queryPagination,
      currentUserId,
    );
  }
}
