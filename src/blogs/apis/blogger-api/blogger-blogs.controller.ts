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
import { BlogsQueryRepository } from '../../repositories/blogs.query.repository';
import { CustomException } from '../../../functions/custom-exception';
import { isValid } from '../../../functions/isValid-Id';
import { PostsService } from '../../../posts/posts.service';
import { PostsQueryRepository } from '../../../posts/repositories/posts.query.repository';
import { CreateBlogInputModel } from '../../blogs-input-models/create-blog-input-model.dto';
import { CurrentUserId } from '../../../decorators/current-user-id.param.decorator';
import { QueryPaginationInputModel } from '../../blogs-input-models/query-pagination-input-model.dto';
import { CreatePostForSpecialBlogInputModelDto } from '../../../posts/input-models/create-post-for-special-blog-input-model.dto';
import { JwtAccessGuard } from '../../../auth-guards/jwt-access.guard';
import { BloggerBlogsService } from './blogger-blogs.service';
import { CreateBlogByBloggerCommand } from './blogger-blogs.use.cases/create-blog-by-blogger-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogByBloggerCommand } from './blogger-blogs.use.cases/update-blog-by-blogger-use-case';
import { DeleteBlogByBloggerCommand } from './blogger-blogs.use.cases/delete-blog-by-blogger-use-case';
import { CreatePostForSpecialBlogCommand } from './blogger-blogs.use.cases/create-post-for-special-blog-by-blogger-use-case';
import { UpdateExistingPostForBlogCommand } from './blogger-blogs.use.cases/update-existing-post-for-blog-by-blogger-use-case';
import { DeletePostByBloggerCommand } from './blogger-blogs.use.cases/delete-post-by-blogger-use-case';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    protected bloggerBlogsService: BloggerBlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
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
    const foundBlogs = await this.blogsQueryRepository.findAllBlogsForBlogger(
      queryPagination,
      currentUserId,
    );
    return foundBlogs;
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

    if (isUpdated === 'NotFound') {
      throw new CustomException(null, HttpStatus.NOT_FOUND);
    }
    if (isUpdated === 'NotOwner') {
      throw new CustomException(null, HttpStatus.FORBIDDEN);
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
    if (isDeleted === 'NotOwner') {
      throw new CustomException(null, HttpStatus.FORBIDDEN);
    }

    if (isDeleted === 'NotFound') {
      throw new CustomException(null, HttpStatus.NOT_FOUND);
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

    if (postCreated === 'NotOwner') {
      throw new CustomException(null, HttpStatus.FORBIDDEN);
    }

    if (postCreated === 'NotFound') {
      throw new CustomException(null, HttpStatus.NOT_FOUND);
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
    /*isValid(blogId);
    isValid(postId);*/

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

    if (postUpdated === 'NotOwner') {
      throw new CustomException(null, HttpStatus.FORBIDDEN);
    }

    if (postUpdated === 'NotFound') {
      throw new CustomException(null, HttpStatus.NOT_FOUND);
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
    if (isDeleted === 'NotOwner') {
      throw new CustomException(null, HttpStatus.FORBIDDEN);
    }

    if (isDeleted === 'NotFound') {
      throw new CustomException(null, HttpStatus.NOT_FOUND);
    }

    return;
  }
}