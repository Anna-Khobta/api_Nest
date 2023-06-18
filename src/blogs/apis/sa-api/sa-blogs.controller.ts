import {
  Body,
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
import { BanBlogInputModel } from '../../blogs-input-models/ban-blog-unput-model.dto';
import { BanBlogBySaCommand } from './sa-blogs.use.cases/ban-blog-by-sa-use-case';
import {
  exceptionHandler,
  ResultCode,
} from '../../../functions/exception-handler';

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
    return await this.blogsQueryRepository.findBlogsForSa(queryPagination);
  }

  @Put(':id/ban')
  @UseGuards(BasicAuthGuard)
  async banUnbanBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BanBlogInputModel,
  ) {
    const updateBanBlog = await this.commandBus.execute(
      new BanBlogBySaCommand(blogId, inputModel.isBanned),
    );

    if (updateBanBlog.code !== ResultCode.Success) {
      return exceptionHandler(updateBanBlog.code);
    }

    return;
  }
}
