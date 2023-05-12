export class BlogClassDbType {
  createdAt: string;
  isMembership: boolean;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
  }
}

// n
