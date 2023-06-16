import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

import {
  basicAuth,
  blogDescription,
  blogName,
  blogUrl,
  commentContent,
  fourthEmail,
  fourthLogin,
  myEmail,
  myLogin,
  myPassword,
  postContent,
  postShortDescription,
  postTitle,
  secondEmail,
  secondLogin,
  thirdEmail,
  thirdLogin,
} from './tests-functions';
import { LikeStatusesEnum } from '../src/types/types';

// const users = () => {
//   getUser1: () => expect.getState().user1;
//   getUser1: () => expect.setState({ user1: 123 });
// };
// users.getUser1(); // будут лежать данные юзера
/*const obj = {
  name: 4,
  5: 10,
}
obj.name

obj["5"]//10

obj[]//10*/

describe('Comments (e2e)', () => {
  const second = 1000;
  jest.setTimeout(600 * second);

  let mms: MongoMemoryServer;
  let server;
  let app: INestApplication;

  beforeAll(async () => {
    mms = await MongoMemoryServer.create();
    const mongoUrl = mms.getUri();
    process.env['MONGO_URI'] = mongoUrl;

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
  /*let app: INestApplication;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await app.close();
  });*/
  /*it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World! Anna');
  });

  /!*it('/sa/users (get)', () => {
    return request(app.getHttpServer()).get('/sa/users').expect(401);
  });*!/*/

  it('post users', async () => {
    const deleteAll = await request(app.getHttpServer())
      .delete('/testing/all-data')
      .expect(204);

    const createUser1 = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', basicAuth)
      .send({ login: myLogin, password: myPassword, email: myEmail })
      .expect(201);
    expect.setState({ user: createUser1 });

    const createUser2 = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', basicAuth)
      .send({ login: secondLogin, password: secondLogin, email: secondEmail })
      .expect(201);

    const createUser3 = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', basicAuth)
      .send({ login: thirdLogin, password: thirdLogin, email: thirdEmail })
      .expect(201);

    const createUser4 = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', basicAuth)
      .send({ login: fourthLogin, password: fourthLogin, email: fourthEmail })
      .expect(201);

    const loginUser1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: myLogin,
        password: myPassword,
      })
      .expect(200);

    const loginUser2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: secondLogin,
        password: secondLogin,
      })
      .expect(200);

    const loginUser3 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: thirdLogin,
        password: thirdLogin,
      })
      .expect(200);

    const loginUser4 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: fourthLogin,
        password: fourthLogin,
      })
      .expect(200);

    const user1AT = loginUser1.body.accessToken;
    const user2AT = loginUser2.body.accessToken;
    const user3AT = loginUser3.body.accessToken;
    const user4AT = loginUser4.body.accessToken;

    const createBlog = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .auth(user1AT, { type: 'bearer' })
      .send({
        name: blogName,
        description: blogDescription,
        websiteUrl: blogUrl,
      });
    expect(createBlog.status).toBe(201);

    const createPost = await request(app.getHttpServer())
      .post('/blogger/blogs/' + createBlog.body.id + '/posts')
      .auth(user1AT, { type: 'bearer' })
      .send({
        title: postTitle,
        shortDescription: postShortDescription,
        content: postContent,
        blogId: createBlog.body.id,
      });
    expect(createPost.status).toBe(201);

    const createComment = await request(app.getHttpServer())
      .post('/posts/' + createPost.body.id + '/comments')
      .auth(user1AT, { type: 'bearer' })
      .send({
        content: commentContent,
      });
    expect(createComment.status).toBe(201);

    const getComment = await request(app.getHttpServer())
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);
    expect(getComment.body.likesInfo.likesCount).toStrictEqual(0);
    expect(getComment.body.likesInfo.dislikesCount).toStrictEqual(0);

    const user2PutLike = await request(app.getHttpServer())
      .put('/comments/' + createComment.body.id + '/like-status')
      .auth(user2AT, { type: 'bearer' })
      .send({
        likeStatus: LikeStatusesEnum.Like,
      })
      .expect(204);

    const getCommentByUser1After1Like = await request(app.getHttpServer())
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);

    expect(getCommentByUser1After1Like.body.likesInfo.likesCount).toStrictEqual(
      1,
    );
    expect(
      getCommentByUser1After1Like.body.likesInfo.dislikesCount,
    ).toStrictEqual(0);

    const user3PutLike = await request(app.getHttpServer())
      .put('/comments/' + createComment.body.id + '/like-status')
      .auth(user3AT, { type: 'bearer' })
      .send({
        likeStatus: LikeStatusesEnum.Like,
      })
      .expect(204);

    const getCommentByUser1After2Like = await request(app.getHttpServer())
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);

    expect(getCommentByUser1After2Like.body.likesInfo.likesCount).toStrictEqual(
      2,
    );
    expect(
      getCommentByUser1After2Like.body.likesInfo.dislikesCount,
    ).toStrictEqual(0);

    const banUser2 = await request(app.getHttpServer())
      .put('/sa/users/' + createUser2.body.id + '/ban')
      .set('Authorization', basicAuth)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst11111',
      })
      .expect(204);

    const getCommentByUser1After2LikeAnd1Banned = await request(
      app.getHttpServer(),
    )
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);

    expect(
      getCommentByUser1After2LikeAnd1Banned.body.likesInfo.likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser1After2LikeAnd1Banned.body.likesInfo.dislikesCount,
    ).toStrictEqual(0);

    const getCommentByUser2After2LikeAnd1Banned = await request(
      app.getHttpServer(),
    )
      .get('/comments/' + createComment.body.id)
      .auth(user2AT, { type: 'bearer' })
      .expect(200);

    expect(
      getCommentByUser2After2LikeAnd1Banned.body.likesInfo.likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser2After2LikeAnd1Banned.body.likesInfo.dislikesCount,
    ).toStrictEqual(0);
    expect(
      getCommentByUser2After2LikeAnd1Banned.body.likesInfo.myStatus,
    ).toStrictEqual(LikeStatusesEnum.None);

    const banUser3 = await request(app.getHttpServer())
      .put('/sa/users/' + createUser3.body.id + '/ban')
      .set('Authorization', basicAuth)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst11111',
      })
      .expect(204);

    const getCommentByUser1After2LikeAnd2Banned = await request(
      app.getHttpServer(),
    )
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);

    expect(
      getCommentByUser1After2LikeAnd2Banned.body.likesInfo.likesCount,
    ).toStrictEqual(0);
    expect(
      getCommentByUser1After2LikeAnd2Banned.body.likesInfo.dislikesCount,
    ).toStrictEqual(0);

    const unbanUser2 = await request(app.getHttpServer())
      .put('/sa/users/' + createUser2.body.id + '/ban')
      .set('Authorization', basicAuth)
      .send({
        isBanned: false,
        banReason: 'stringstringstringst11111',
      })
      .expect(204);

    const getCommentByUser1After2LikeAnd2Banned1Unbanned = await request(
      app.getHttpServer(),
    )
      .get('/comments/' + createComment.body.id)
      .auth(user1AT, { type: 'bearer' })
      .expect(200);

    expect(
      getCommentByUser1After2LikeAnd2Banned1Unbanned.body.likesInfo.likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser1After2LikeAnd2Banned1Unbanned.body.likesInfo
        .dislikesCount,
    ).toStrictEqual(0);

    const getCommentByUser2After2LikeAnd2Banned1Unbanned = await request(
      app.getHttpServer(),
    )
      .get('/comments/' + createComment.body.id)
      .auth(user2AT, { type: 'bearer' })
      .expect(200);

    expect(
      getCommentByUser2After2LikeAnd2Banned1Unbanned.body.likesInfo.likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser2After2LikeAnd2Banned1Unbanned.body.likesInfo
        .dislikesCount,
    ).toStrictEqual(0);
    expect(
      getCommentByUser2After2LikeAnd2Banned1Unbanned.body.likesInfo.myStatus,
    ).toStrictEqual(LikeStatusesEnum.Like);

    const user4PutDisLike = await request(app.getHttpServer())
      .put('/comments/' + createComment.body.id + '/like-status')
      .auth(user4AT, { type: 'bearer' })
      .send({
        likeStatus: LikeStatusesEnum.Dislike,
      })
      .expect(204);

    const getCommentByUser2After2LikeAnd2Banned1Unbanned1Dislike =
      await request(app.getHttpServer())
        .get('/comments/' + createComment.body.id)
        .auth(user2AT, { type: 'bearer' })
        .expect(200);

    expect(
      getCommentByUser2After2LikeAnd2Banned1Unbanned1Dislike.body.likesInfo
        .likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser2After2LikeAnd2Banned1Unbanned1Dislike.body.likesInfo
        .dislikesCount,
    ).toStrictEqual(1);

    const banUser4 = await request(app.getHttpServer())
      .put('/sa/users/' + createUser4.body.id + '/ban')
      .set('Authorization', basicAuth)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst11111',
      })
      .expect(204);

    const getCommentByUser2After2LikeAnd3Banned1Unbanned1Dislike =
      await request(app.getHttpServer())
        .get('/comments/' + createComment.body.id)
        .auth(user1AT, { type: 'bearer' })
        .expect(200);

    expect(
      getCommentByUser2After2LikeAnd3Banned1Unbanned1Dislike.body.likesInfo
        .likesCount,
    ).toStrictEqual(1);
    expect(
      getCommentByUser2After2LikeAnd3Banned1Unbanned1Dislike.body.likesInfo
        .dislikesCount,
    ).toStrictEqual(0);
    //console.log('user', expect.getState().user);
  });
});
