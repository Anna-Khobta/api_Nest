import request from 'supertest';
import { basicAuth, LoginPasswEmail } from './tests-objects';
import { CreateBlogInputModel } from '../src/blogs/blogs-input-models/create-blog-input-model.dto';
import { CreatePostForSpecialBlogInputModelDto } from '../src/posts/input-models/create-post-for-special-blog-input-model.dto';

export const deleteAll = async (app: any) => {
  return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
};

export const createUserBySa = async (
  app: any,
  loginPasswordEmail: LoginPasswEmail,
) => {
  return request(app.getHttpServer())
    .post('/sa/users')
    .set('Authorization', basicAuth)
    .send({
      login: loginPasswordEmail.login,
      password: loginPasswordEmail.password,
      email: loginPasswordEmail.email,
    })
    .expect(201);
};

export const createSeveralUserBySa = async (
  app: any,
  numberTimes: number,
  loginPasswordEmail: any,
) => {
  const items = [];

  for (let i = 0; i < numberTimes; i++) {
    const createResponse = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', basicAuth)
      .send({
        login: loginPasswordEmail[i].login,
        password: loginPasswordEmail[i].password,
        email: loginPasswordEmail[i].email,
      })
      .expect(201);
    items.push(createResponse.body);
  }
  return items;
};

export const loginUser = async (
  app: any,
  loginPasswordEmail: LoginPasswEmail,
) => {
  return request(app.getHttpServer())
    .post('/auth/login')
    .send({
      loginOrEmail: loginPasswordEmail.login,
      password: loginPasswordEmail.password,
    })
    .expect(200);
};

export const createBlogByBlogger = async (
  app: any,
  accessToken: string,
  createBlogData: CreateBlogInputModel,
) => {
  return request(app.getHttpServer())
    .post('/blogger/blogs')
    .auth(accessToken, { type: 'bearer' })
    .send({
      name: createBlogData.name,
      description: createBlogData.description,
      websiteUrl: createBlogData.websiteUrl,
    })
    .expect(201);
};

export const createPostByBlogger = async (
  app: any,
  accessToken: string,
  blogId: string,
  createPostData: CreatePostForSpecialBlogInputModelDto,
) => {
  return request(app.getHttpServer())
    .post('/blogger/blogs/' + blogId + '/posts')
    .auth(accessToken, { type: 'bearer' })
    .send({
      title: createPostData.title,
      shortDescription: createPostData.shortDescription,
      content: createPostData.content,
    })
    .expect(201);
};

export const getPostsPublicApi = async (app: any) => {
  return request(app.getHttpServer()).get('/posts');
};

export const getPostByIdPublicApi = async (app: any, postId: string) => {
  return request(app.getHttpServer()).get('/posts/' + postId);
};

// =============================================================

export const getBlogsPublicApi = async (app: any) => {
  return request(app.getHttpServer()).get('/blogs');
};

export const getBlogsByIdPublicApi = async (app: any, blogId: string) => {
  return request(app.getHttpServer()).get('/blogs/' + blogId);
};

export const getBlogsBySa = async (app: any, blogId: string) => {
  return request(app.getHttpServer())
    .get('/blogs/')
    .set('Authorization', basicAuth);
};

// =============================================

export const banUnbanBlogBySa = async (app: any, blogId: string) => {
  return request(app.getHttpServer())
    .put('/sa/blogs/' + blogId + '/ban')
    .set('Authorization', basicAuth)
    .send({
      isBanned: true,
    })
    .expect(200);
};
