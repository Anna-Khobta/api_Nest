import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/db/blogs-schema';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
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
import { UsersQueryRepository } from './users/users-repositories/users.query.repository';
import { UsersRepository } from './users/users-repositories/users.repository';
import { AppController } from './app.controller';
import { DeleteAllController } from './delete-all/delete-all.controller';
import { DeleteAllService } from './delete-all/delete-all.service';
import { DeleteAllRepository } from './delete-all/delete-all.repository';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth-guards/local.strategy';
import { JwtAccessStrategy } from './auth-guards/jwt-access.strategy';
import { BasicStrategy } from './auth-guards/basic.strategy';
import { AuthController } from './auth/auth.controller';
import { DeviceService } from './devices/device.service';
import { DeviceRepository } from './devices/device.repository';
import { DeviceDb, DeviceSchema } from './devices/device-schema';
import { JwtRefreshStrategy } from './auth-guards/jwt-refresh.strategy';
import { jwtConstants } from './auth-guards/constants';
import { EmailsManager } from './managers/emails-manager';
import { RecoveryCodeGuard } from './auth-guards/recoveryCode.guard';
import { Comment, CommentSchema } from './comments/comments-schema';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { IfElseUserAuthGuard } from './auth-guards/if.else.user.auth.guard';
export const configModule = ConfigModule.forRoot({ isGlobal: true });

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
      {
        name: DeviceDb.name,
        schema: DeviceSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
    DeleteAllController,
    AuthController,
  ],

  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
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
    BasicStrategy,
    DeviceService,
    DeviceRepository,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    EmailsManager,
    RecoveryCodeGuard,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    IfElseUserAuthGuard,
  ],
})
export class AppModule {}
