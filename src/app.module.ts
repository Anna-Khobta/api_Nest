import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './cats/cats-schema';
import { CatsRepository } from './cats/cats.repository';
import { Blog, BlogSchema } from './blogs/blogs-schema';
import { BlogsService } from './blogs/blogs.service';
import { BlogsDbRepository } from './blogs/blogs.db.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';

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
    ]),
  ],
  controllers: [AppController, UsersController, BlogsController],
  providers: [
    AppService,
    CatsRepository,
    UsersService,
    UsersRepository,
    BlogsService,
    BlogsDbRepository,
    BlogsQueryRepository,
  ],
})
export class AppModule {}
