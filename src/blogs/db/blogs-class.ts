export class BlogClassDbType {
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: null | string;
    userLogin: null | string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
  };
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId = null,
    public userLogin = null,
    public isBanned = false,
    public banDate = null,
  ) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
    this.blogOwnerInfo = {
      userId,
      userLogin,
    };
    this.banInfo = {
      isBanned,
      banDate,
    };
  }
}
