import { SortOrder } from 'mongoose';

export const getUsersPagination = (query: any) => {
  const page: number = Number(query.pageNumber) || 1;
  const limit: number = Number(query.pageSize) || 10;
  const sortDirection: SortOrder = query.sortDirection === 'asc' ? 1 : -1;

  let sortBy: string = query.sortBy || 'accountData.createdAt';

  if (sortBy === 'login') {
    sortBy = 'accountData.login';
  }
  if (sortBy === 'email') {
    sortBy = 'accountData.email';
  }
  if (sortBy === 'createdAt') {
    sortBy = 'accountData.createdAt';
  }

  const skip: number = (page - 1) * limit; // Calculate skip values based on the page and pageSize

  const searchNameTerm: string = query.searchNameTerm || '';
  const searchLoginTerm: string = query.searchLoginTerm || '';
  const searchEmailTerm: string = query.searchEmailTerm || '';

  return {
    page,
    limit,
    sortDirection,
    sortBy,
    skip,
    searchNameTerm,
    searchLoginTerm,
    searchEmailTerm,
  };
};
