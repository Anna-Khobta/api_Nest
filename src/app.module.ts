import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Users1Controller } from './cats,users,from lesson/users1.controller';
import { Users1Service } from './cats,users,from lesson/users1.service';
import { Users1Repository } from './cats,users,from lesson/users1.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './cats,users,from lesson/cats-schema';
import { CatsRepository } from './cats,users,from lesson/cats.repository';
import { Blog, BlogSchema } from './blogs/db/blogs-schema';
import { BlogsService } from './blogs/blogs.service';
import { BlogsDbRepository } from './blogs/repositories/blogs.db.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query.repository';
import { Post, PostSchema } from './posts/posts-schema';
import { PostsController } from './posts/posts-controller';
import { PostsService } from './posts/posts-service';
import { PostsQueryRepository } from './posts/posts-query-repository';
import { PostsDbRepository } from './posts/posts-db-repository';
import { User, UserSchema } from './users/users-schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://0.0.0.0:27017', {
      dbName: 'nest-test',
    }),
    MongooseModule.forFeature([
      {
        name: Cat.name,
        schema: CatSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    AppController,
    Users1Controller,
    BlogsController,
    PostsController,
  ],
  providers: [
    AppService,
    CatsRepository,
    Users1Service,
    Users1Repository,
    BlogsService,
    BlogsDbRepository,
    BlogsQueryRepository,
    PostsService,
    PostsQueryRepository,
    PostsDbRepository,
  ],
})
export class AppModule {}
