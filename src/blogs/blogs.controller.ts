import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';

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

    //console.log(blogIdIsCreated, 'blogIdIsCreated');

    const blogById = await this.blogsQueryRepository.findBlogByIdViewModel(
      blogIdIsCreated,
    );

    //console.log(blogById, 'blogById');

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
  async getBlogById(@Param('id') blogId: string, @Res() res) {
    const blogById = await this.blogsQueryRepository.findBlogById(blogId);
    if (blogById) {
      return res.status(HttpStatus.OK).json(blogById);
    } else {
      return res.status(HttpStatus.NOT_FOUND).send();
    }
  }
}

/*
      .put('/blogs/:id',
        authorizationMiddleware,
        nameValidation,
        descriptionValidation,
        websiteUrlValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const isUpdated = await blogsService.updateBlog(((+req.params.id).toString()), req.body.name, req.body.description, req.body.websiteUrl)
            if (isUpdated) {
                // const blog = await blogsRepository.findBlogById(req.params.id)
                res.sendStatus(204)
            } else {
                res.sendStatus(404)
            }
        })

      .delete('/blogs/:id',
        authorizationMiddleware,
        async (req: Request, res: Response) => {

            const isDeleted = await blogsService.deleteBlog(req.params.id)

            if (isDeleted) {
                res.sendStatus(204)
            } else {
                res.sendStatus(404)
            }
        })

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
