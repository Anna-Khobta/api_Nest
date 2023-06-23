import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { isValid } from '../../../functions/isValid-Id';
import { CurrentUserId } from '../../../decorators/current-user-id.param.decorator';
import { JwtAccessGuard } from '../../../auth-guards/jwt-access.guard';
import { CommandBus } from '@nestjs/cqrs';

import {
  exceptionHandler,
  ResultCode,
} from '../../../functions/exception-handler';
import { BlogsQueryRepository } from '../../../blogs/repositories/blogs.query.repository';
import { BanUserByBlogerInputModel } from '../../input-models/ban-user-by-bloger.dto';
import { BanUserByBloggerCommand } from './blogger-user.use.cases/ban-user-by-blogger-use-case';
import { QueryPaginationInputModel } from '../../../blogs/blogs-input-models/query-pagination-input-model.dto';
import { BlogsService } from '../../../blogs/blogs.service';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,

    protected blogsService: BlogsService,
  ) {}

  @Put(':id/ban')
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  async banUnbanUserByBlogger(
    @Param('id') userId: string,
    @Body() inputModel: BanUserByBlogerInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(userId);

    const updateBanBlog = await this.commandBus.execute(
      new BanUserByBloggerCommand(userId, inputModel, currentUserId),
    );

    if (updateBanBlog.code !== ResultCode.Success) {
      return exceptionHandler(updateBanBlog.code);
    }

    return;
  }

  @Get('blog/:id')
  @UseGuards(JwtAccessGuard)
  async getAllBannedUsersForBlog(
    @Param('id') blogId: string,
    @Query() queryPagination: QueryPaginationInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const isBlogExist = await this.blogsService.isBlogExistInDb(blogId);
    if (!isBlogExist) {
      return exceptionHandler(ResultCode.NotFound);
    }

    const isUserOwner = await this.blogsService.isUserOwnBlog(
      blogId,
      currentUserId,
    );
    if (!isUserOwner) {
      return exceptionHandler(ResultCode.Forbidden);
    }

    return await this.blogsQueryRepository.findAllBannedUsersForSpecialBlog(
      blogId,
      queryPagination,
    );
  }
}
