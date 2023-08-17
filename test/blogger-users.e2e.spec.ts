import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

import {
  banUnbanBlogBySa,
  createBlogByBlogger,
  createUserBySa,
  deleteAll,
  getBlogsByIdPublicApi,
  getBlogsPublicApi,
  loginUser,
  getBlogsBySa,
  createPostByBlogger,
  getPostsPublicApi,
  getPostByIdPublicApi,
  createSeveralUserBySa,
} from './tests-functions';
import {
  banUserByBloggerData,
  create12UsersData,
  createBlogData,
  createCommentData,
  createPostData,
  registrationData1,
  registrationData2,
} from './tests-objects';
import {
  banUnbanUserByBlogger,
  getAllBannedUsersByBlogger,
} from './test-helpers/blogger-api';
import { createNewComment } from './test-helpers/posts-api';
import * as process from 'process';

describe('blogger/users (e2e)', () => {
  const second = 1000;
  jest.setTimeout(600 * second);

  let mms: MongoMemoryServer;
  let server;
  let app: INestApplication;

  beforeAll(async () => {
    mms = await MongoMemoryServer.create();
    const mongoUrl =
      'mongodb+srv://AnnaKh:MJV7zwCjuKhpMOHg@cluster0.26ojfvx.mongodb.net/bloger-tests?retryWrites=true&w=majority';
    process.env['MONGO_URL2'] = mongoUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication();
    await app.init();
    server = await app.getHttpServer();
  });

  afterAll(async () => {
    await mms.stop();
    await app.close();
  });

  it('ban/unban blog by sa, get blogs by different apis', async () => {
    await deleteAll(app);

    await createUserBySa(app, registrationData1);
    const loginUser1 = await loginUser(app, registrationData1);
    const user1AT = loginUser1.body.accessToken;

    const createBlog = await createBlogByBlogger(app, user1AT, createBlogData);
    const blogId = createBlog.body.id;

    const getBlogsPublic = await getBlogsPublicApi(app);
    expect(getBlogsPublic.status).toBe(200);

    const getBlogById = await getBlogsByIdPublicApi(app, blogId);
    expect(getBlogById.status).toBe(200);

    const getAllBlogsBySa = await getBlogsBySa(app, blogId);
    expect(getAllBlogsBySa.status).toBe(200);

    const banBlogBySa = await banUnbanBlogBySa(app, blogId);

    const getBlogsAfterBanPublic = await getBlogsPublicApi(app);
    expect(getBlogsAfterBanPublic.status).toBe(200);

    const getBlogByIdAfterBan = await getBlogsByIdPublicApi(app, blogId);
    expect(getBlogByIdAfterBan.status).toBe(404);

    const getAllBlogsBySaAfterBan = await getBlogsBySa(app, blogId);
    expect(getAllBlogsBySaAfterBan.status).toBe(200);
  });

  it('return post of ban/unban blog by different apis', async () => {
    await deleteAll(app);

    await createUserBySa(app, registrationData1);

    const loginUser1 = await loginUser(app, registrationData1);
    const user1AT = loginUser1.body.accessToken;

    const createBlog = await createBlogByBlogger(app, user1AT, createBlogData);
    const blogId = createBlog.body.id;

    const createPostInThisBlog = await createPostByBlogger(
      app,
      user1AT,
      blogId,
      createPostData,
    );
    const postId = createPostInThisBlog.body.id;

    const getPostsPublic = await getPostsPublicApi(app);
    expect(getPostsPublic.status).toBe(200);

    const getPostById = await getPostByIdPublicApi(app, postId);
    expect(getPostById.status).toBe(200);

    const banBlogBySa = await banUnbanBlogBySa(app, blogId);

    const getPostsPublicAfterBan = await getPostsPublicApi(app);
    expect(getPostsPublicAfterBan.status).toBe(200);

    const getPostByIdAfterBan = await getPostByIdPublicApi(app, postId);
    expect(getPostByIdAfterBan.status).toBe(404);
  });

  it('GET "blogger/users/blog/:id": should return error if :id from uri param not found', async () => {
    await deleteAll(app);

    const createUser1 = await createUserBySa(app, registrationData1);
    const createUser2 = await createUserBySa(app, registrationData2);

    const loginUser1 = await loginUser(app, registrationData1);
    const user1AT = loginUser1.body.accessToken;

    const loginUser2 = await loginUser(app, registrationData2);
    const user2AT = loginUser2.body.accessToken;

    const createBlog = await createBlogByBlogger(app, user1AT, createBlogData);
    const blogId = createBlog.body.id;

    const createPostInThisBlog = await createPostByBlogger(
      app,
      user1AT,
      blogId,
      createPostData,
    );
    const postId = createPostInThisBlog.body.id;

    const banUser2ByUser1 = await banUnbanUserByBlogger(
      app,
      user1AT,
      banUserByBloggerData,
      createUser2.body.id,
      blogId,
    );
    expect(banUser2ByUser1.status).toBe(204);

    const tryToMakeCommentByUser2 = await createNewComment(
      app,
      user2AT,
      postId,
      createCommentData,
    );
    expect(tryToMakeCommentByUser2.status).toBe(403);
  });

  it('create 12 users, ban, return bannedUsers with pagination', async () => {
    await deleteAll(app);

    const createUser1 = await createUserBySa(app, registrationData1);

    const create12Users = await createSeveralUserBySa(
      app,
      12,
      create12UsersData,
    );
    expect(create12Users.length).toBe(12);

    const loginUser1 = await loginUser(app, registrationData1);
    const user1AT = loginUser1.body.accessToken;

    const createBlog = await createBlogByBlogger(app, user1AT, createBlogData);
    const blogId = createBlog.body.id;

    //let ban12UsersByUser1;
    for (let i = 0; i < create12Users.length; i++) {
      const ban12UsersByUser1 = await request(app.getHttpServer())
        .put('/blogger/users/' + create12Users[i].id + '/ban')
        .auth(user1AT, { type: 'bearer' })
        .send({
          isBanned: banUserByBloggerData.isBanned,
          banReason: banUserByBloggerData.banReason,
          blogId: blogId,
        })
        .expect(204);
      expect(ban12UsersByUser1.status).toBe(204);
      expect(ban12UsersByUser1).not.toBeUndefined();
    }

    /*for (let i = 0; i < create12Users.length; i++) {
      const unban12UsersByUser1 = await request(app.getHttpServer())
        .put('/blogger/users/' + create12Users[i].id + '/ban')
        .auth(user1AT, { type: 'bearer' })
        .send({
          isBanned: false,
          banReason: banUserByBloggerData.banReason,
          blogId: blogId,
        })
        .expect(204);
      expect(unban12UsersByUser1.status).toBe(204);
      expect(unban12UsersByUser1).not.toBeUndefined();
    }*/

    const get12BannedUsersWithPagination = await getAllBannedUsersByBlogger(
      app,
      user1AT,
      blogId,
    );
    expect(get12BannedUsersWithPagination.body).not.toBeUndefined();

    /*ban12UsersByUser1 = await banUnbanUserByBlogger(
        app,
        user1AT,
        banUserByBloggerData,
        create12Users[i].id,
        blogId,
      );
      expect(ban12UsersByUser1.status).toBe(204);*/

    //expect(ban12UsersByUser1.body.items.length).toBe(12);

    /*    const get12BannedUsersWithPagination = await getAllBannedUsersByBlogger(
      app,
      user1AT,
      blogId,
    );*/
  });

  it('PUT -> "/blogger/users/:id/ban', async () => {
    await deleteAll(app);

    const createUser1 = await createUserBySa(app, registrationData1);
    const createUser2 = await createUserBySa(app, registrationData2);

    const loginUser1 = await loginUser(app, registrationData1);
    const user1AT = loginUser1.body.accessToken;

    const createBlog = await createBlogByBlogger(app, user1AT, createBlogData);
    const blogId = createBlog.body.id;

    const banUser2ByUser1 = await banUnbanUserByBlogger(
      app,
      user1AT,
      banUserByBloggerData,
      createUser2.body.id,
      blogId,
    );
    expect(banUser2ByUser1.status).toBe(204);
    expect(banUser2ByUser1).not.toBeUndefined();
    expect(banUser2ByUser1.body).not.toBeUndefined();
  });
});
