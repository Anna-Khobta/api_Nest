import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
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
  async deleteBlogById(@Param('id') blogId: string) {
    isValid(blogId);
    const isDeleted = await this.blogsService.deleteBlog(blogId);
    if (!isDeleted) {
      throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
    }
    return;
  }
}

/*

      //create new post for special blog
      .post('/blogs/:blogId/posts',
        authorizationMiddleware,
        titleValidation,
        shortDescriptionValidation,
        contentValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const createdPostId = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.blogId)

            if (!createdPostId) {
                return res.sendStatus(404)
            }

            const postView = await postQueryRepository.findPostById(createdPostId)

            res.status(201).send(postView)

        })


      .get("/blogs/:blogId/posts",
        authBearerFindUser,
        async (req: Request, res: Response) => {

            const userInfo = req.user

            const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

            const blogId = req.params.blogId

            let checkBlogByID = await blogsQueryRepository.findBlogByblogId(req.params.blogId)

            if (!checkBlogByID) {
                return res.send(404)
            }

            if (!userInfo) {

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
