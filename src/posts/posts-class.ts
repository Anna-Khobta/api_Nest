import { UserLikeInfo } from '../types/types';
// n
export class PostClassDbType {
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  usersEngagement: UserLikeInfo[];

  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
    this.likesCount = 0;
    this.dislikesCount = 0;
    this.usersEngagement = [];
  }
}
