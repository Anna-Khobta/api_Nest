import { IsUrl, Length } from 'class-validator';

export class CreateBlogInputModelClass {
  @Length(0, 15)
  name: string;
  @Length(0, 500)
  description: string;
  @Length(0, 100)
  @IsUrl()
  websiteUrl: string;
}

export class QueryPaginationInputModelClass {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
}
