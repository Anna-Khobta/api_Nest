export class CreateBlogInputModelClass {
  name: string;
  description: string;
  websiteUrl: string;
}

export class QueryPaginationInputModelClass {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
}
