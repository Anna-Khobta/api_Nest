import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/db/blogs-schema';
import { BlogsService } from './blogs/blogs.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query.repository';
import { Post, PostSchema } from './posts/posts-schema';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostsRepository } from './posts/posts.repository';
import { User, UserSchema } from './users/users-schema';
import { OldUsersController } from './users/api/old.users.controller';
import { UsersService } from './users/sa-api/users.service';
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
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { CommentsQueryRepository } from './comments/repositories/comments.query.repository';
import { BlogIdValidator } from './decorators/BlogId.validator';
import { CommentsController } from './comments/comments.controller';
import { IfRefreshTokenInDbGuard } from './auth-guards/if.Refresh.Token.In.Db.guard';
import { DevicesController } from './devices/devices.controller';
import { IfHaveUserJwtAccessGuard } from './auth-guards/if.have.user.jwt-access.guard';
import { IpLimitGuard } from './auth-guards/ip.limit/ip.limit.guard';
import { IpLimitRepository } from './auth-guards/ip.limit/ip.limit.repository';
import { LocalStrategy } from './auth-guards/local.strategy';
import { CommentSchema, Comment } from './comments/comments-schema';
import { IpDb, IpDbSchema } from './auth-guards/ip.limit/ip-limit-schema';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { SaUsersController } from './users/sa-api/sa.users.controller';
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
      {
        name: IpDb.name,
        schema: IpDbSchema,
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
    OldUsersController,
    SaUsersController,
    DeleteAllController,
    AuthController,
    CommentsController,
    DevicesController,
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
    IfHaveUserJwtAccessGuard,
    IfRefreshTokenInDbGuard,
    BlogIdValidator,
    IpLimitGuard,
    IpLimitRepository,
  ],
})
export class AppModule {}
