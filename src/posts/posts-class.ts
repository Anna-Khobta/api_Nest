import { UserLikeInfo } from '../types/types';
export class PostClassDbType {
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  blogOwnerInfo: {
    userId: null | string;
    userLogin: null | string;
  };
  usersEngagement: UserLikeInfo[];

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public userId: null | string,
    public userLogin: null | string,
  ) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
    this.blogOwnerInfo = {
      userId,
      userLogin,
    };
    this.likesCount = 0;
    this.dislikesCount = 0;
    this.usersEngagement = [];
  }
}
