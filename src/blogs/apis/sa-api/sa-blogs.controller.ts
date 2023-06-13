import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../blogs.service';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { PostsService } from '../../../posts/posts.service';
import { BasicAuthGuard } from '../../../auth-guards/basic-auth.guard';
import { QueryPaginationInputModel } from '../../blogs-input-models/query-pagination-input-model.dto';
import { BindBlogWithUserCommand } from './sa-blogs.use.cases/bind-blog-with-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CustomException } from '../../../functions/custom-exception';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    private commandBus: CommandBus,
  ) {}

  @Put(':id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  async updateBlogOwner(
    @Param('id') blogId: string, //  ParamBlogIdInputModel ?
    @Param('userId') userId: string,
  ) {
    const updateOwner = await this.commandBus.execute(
      new BindBlogWithUserCommand(blogId, userId),
    );
    if (!updateOwner) {
      throw new CustomException(
        'Blog or login not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return true;
  }

  @Get()
  async getAllBlogs(@Query() queryPagination: QueryPaginationInputModel) {
    const foundBlogs = await this.blogsQueryRepository.findBlogsForSa(
      queryPagination,
    );
    return foundBlogs;
  }
}
