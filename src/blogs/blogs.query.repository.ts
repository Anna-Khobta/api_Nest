import {BlogsWithPagination, BlogType} from "./db/types";
import {BlogModelClass} from "./db/db";
import {SortOrder} from "mongoose";


export class BlogsQueryRepository {
    async findBlogs(page: number, limit: number, sortDirection: number, sortBy: string, searchNameTerm: string, skip: number):
      Promise<BlogsWithPagination> {

        let findBlogs: BlogType[] = await BlogModelClass.find(
          {name: {$regex: searchNameTerm, $options: 'i'}},
          {projection: {_id: 0}})
          .skip(skip)
          .limit(limit)
          .sort({sortBy: sortDirection})
          .lean()

        const total = await BlogModelClass.countDocuments({name: {$regex: searchNameTerm, $options: 'i'}})
        const pagesCount = Math.ceil(total / limit)
        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findBlogs
        }
    },


    async findBlogById(id: string): Promise<BlogType | null> {
        let blog: BlogType | null = await BlogModelClass.findOne({id: id}, {projection: {_id: 0}}).lean()

        if (blog) {
            return blog
        } else {
            return null
        }
    },


    async findBlogByblogId(blogId: string): Promise<BlogType | null> {

        const result: BlogType | null = await BlogModelClass.findOne({id: blogId}, {projection: {_id: 0}}).lean()

        if (result) {
            return result
        } else {
            return null
        }
    },

    async findBlogName(blogId: string): Promise<BlogType | null> {

        let foundBlogName: BlogType | null = await BlogModelClass.findOne({id: blogId}, {_id: 0}).lean()
        return foundBlogName || null
    }
}
