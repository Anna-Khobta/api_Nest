import {Sort} from "mongodb";


export const getPagination = (query: any) => {
  const page: number = Number(query.pageNumber) || 1;
    const limit: number = Number(query.pageSize) || 10
    const sortDirection = query.sortDirection === 'asc' ? 1 : -1
    const sortBy: string = query.sortBy || 'createdAt'
    // Calculate skip values based on the page and pageSize
    const skip: number = (page - 1) * limit

    const searchNameTerm: string = query.searchNameTerm || ''
    const searchLoginTerm: string = query.searchLoginTerm || ''
    const searchEmailTerm: string = query.searchEmailTerm || ''

    return {page, limit, sortDirection,  sortBy, skip, searchNameTerm, searchLoginTerm, searchEmailTerm }
}
