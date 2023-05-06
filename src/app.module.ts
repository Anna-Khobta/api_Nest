import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/db/blogs-schema';
import { BlogsService } from './blogs/blogs.service';
import { BlogsDbRepository } from './blogs/repositories/blogs.db.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query.repository';
import { Post, PostSchema } from './posts/posts-schema';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostsRepository } from './posts/posts.repository';
import { User, UserSchema } from './users/users-schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersQueryRepository } from './users/users.query.repository';
import { UsersRepository } from './users/users.repository';
import { AppController } from './app.controller';
import { DeleteAllController } from './delete-all/delete-all.controller';
import { DeleteAllService } from './delete-all/delete-all.service';
import { DeleteAllRepository } from './delete-all/delete-all.repository';

export const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
console.log(mongoUri);
console.log(process.env);
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://AnnaKh:MJV7zwCjuKhpMOHg@cluster0.26ojfvx.mongodb.net/blogs-api?retryWrites=true&w=majority',
      {
        dbName: 'nest-test',
      },
    ),
    MongooseModule.forFeature([
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
    BlogsController,
    PostsController,
    UsersController,
    DeleteAllController,
  ],

  providers: [
    AppService,
    BlogsService,
    BlogsDbRepository,
    BlogsQueryRepository,
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    DeleteAllService,
    DeleteAllRepository,
  ],
})
export class AppModule {}
