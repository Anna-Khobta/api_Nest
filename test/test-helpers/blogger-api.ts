import request from 'supertest';
import { BanUserInputModel } from '../../src/users/input-models/ban-user-input-model.dto';

export const banUnbanUserByBlogger = async (
  app: any,
  accessToken: string,
  banUserByBloggerData: BanUserInputModel,
  userId: string,
  blogId: string,
) => {
  return request(app.getHttpServer())
    .put('/blogger/users/' + userId + '/ban')
    .auth(accessToken, { type: 'bearer' })
    .send({
      isBanned: banUserByBloggerData.isBanned,
      banReason: banUserByBloggerData.banReason,
      blogId: blogId,
    });
};

export const getAllBannedUsersByBlogger = async (
  app: any,
  accessToken: string,
  blogId: string,
) => {
  return request(app.getHttpServer())
    .get('/blogger/users/blog/' + blogId)
    .auth(accessToken, { type: 'bearer' });
};
