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
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/local.strategy';
import { JwtStrategy } from './auth/jwt.strategy';
export const configModule = ConfigModule.forRoot();

export const mongoUri = process.env.MONGO_URL || 'mongodb://127.00.1:27017';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'nest-test',
    }),
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
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
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
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule {}
