import request from 'supertest';
import { CreateCommentInputModelDto } from '../../src/comments/input-models/create-comment-input-model.dto';

export const createNewComment = async (
  app: any,
  accessToken: string,
  postId: string,
  contentData: CreateCommentInputModelDto,
) => {
  return request(app.getHttpServer())
    .post('/posts/' + postId + '/comments')
    .auth(accessToken, { type: 'bearer' })
    .send({
      content: contentData.content,
    });
};
