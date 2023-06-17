import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { isValid } from '../../../functions/isValid-Id';
import { CreateBlogInputModel } from '../../blogs-input-models/create-blog-input-model.dto';
import { CurrentUserId } from '../../../decorators/current-user-id.param.decorator';
import { QueryPaginationInputModel } from '../../blogs-input-models/query-pagination-input-model.dto';
import { CreatePostForSpecialBlogInputModelDto } from '../../../posts/input-models/create-post-for-special-blog-input-model.dto';
import { JwtAccessGuard } from '../../../auth-guards/jwt-access.guard';
import { CreateBlogByBloggerCommand } from './blogger-blogs.use.cases/create-blog-by-blogger-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogByBloggerCommand } from './blogger-blogs.use.cases/update-blog-by-blogger-use-case';
import { DeleteBlogByBloggerCommand } from './blogger-blogs.use.cases/delete-blog-by-blogger-use-case';
import { CreatePostForSpecialBlogCommand } from './blogger-blogs.use.cases/create-post-for-special-blog-by-blogger-use-case';
import { UpdateExistingPostForBlogCommand } from './blogger-blogs.use.cases/update-existing-post-for-blog-by-blogger-use-case';
import { DeletePostByBloggerCommand } from './blogger-blogs.use.cases/delete-post-by-blogger-use-case';
import { exceptionHandler } from '../../../functions/exception-handler';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async createNewBlog(
    @Body() inputModel: CreateBlogInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.commandBus.execute(
      new CreateBlogByBloggerCommand(
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
        currentUserId,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAccessGuard)
  async getAllBlogsWhichBloggerIsOwner(
    @Query() queryPagination: QueryPaginationInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.blogsQueryRepository.findAllBlogsForBlogger(
      queryPagination,
      currentUserId,
    );
  }

  @Put(':id')
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  async updateBlogByIdByBlogger(
    @Param('id') blogId: string,
    @Body() inputModel: CreateBlogInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(blogId);

    const isUpdated = await this.commandBus.execute(
      new UpdateBlogByBloggerCommand(
        blogId,
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
        currentUserId,
      ),
    );

    if (isUpdated.code) {
      return exceptionHandler(isUpdated.code);
    }

    return;
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  async deleteBlogByIdByBlogger(
    @Param('id') blogId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(blogId);

    const isDeleted = await this.commandBus.execute(
      new DeleteBlogByBloggerCommand(blogId, currentUserId),
    );
    if (isDeleted.code) {
      return exceptionHandler(isDeleted.code);
    }

    return;
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  @UseGuards(JwtAccessGuard)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: CreatePostForSpecialBlogInputModelDto,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(blogId);

    const postCreated = await this.commandBus.execute(
      new CreatePostForSpecialBlogCommand(
        blogId,
        currentUserId,
        inputModel.title,
        inputModel.shortDescription,
        inputModel.content,
      ),
    );

    if (postCreated.code) {
      return exceptionHandler(postCreated.code);
    }

    return postCreated;
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAccessGuard)
  async updateExistingPostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: CreatePostForSpecialBlogInputModelDto,
    @CurrentUserId() currentUserId: string,
  ) {
    isValid(blogId);
    isValid(postId);

    const postUpdated = await this.commandBus.execute(
      new UpdateExistingPostForBlogCommand(
        blogId,
        postId,
        currentUserId,
        inputModel.title,
        inputModel.shortDescription,
        inputModel.content,
      ),
    );

    if (postUpdated.code) {
      return exceptionHandler(postUpdated.code);
    }

    return postUpdated;
  }
  @Delete(':blogId/posts/:postId')
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  async deleteSpecialPostById(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeletePostByBloggerCommand(blogId, postId, currentUserId),
    );

    if (isDeleted.code) {
      return exceptionHandler(isDeleted.code);
    }

    return isDeleted;
  }
}
