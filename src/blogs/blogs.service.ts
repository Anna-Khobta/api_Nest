import { Injectable } from '@nestjs/common';
import { BlogsDbRepository } from './blogs.db.repository';
import { BlogClassDbType } from './blogs-class';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { BlogViewType } from './types';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsDbRepository: BlogsDbRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<string | null> {
    const newBlog = new BlogClassDbType(name, description, websiteUrl);

    //console.log(newBlog, 'newBlog');

    const blogInstance: BlogDocument = new this.blogModel(newBlog);

    //console.log(blogInstance, 'blogInstance');

    const result = await this.blogsDbRepository.save(blogInstance);

    //console.log(result, 'result');

    return blogInstance._id.toString();
  }
}

/*

    async updateBlog(id: string, name: string, description: string, websiteUrl: string ): Promise<boolean> {

        return await blogsRepository.updateBlog(id, name, description, websiteUrl)
    },


    async deleteBlog(id: string): Promise<boolean> {

        return await blogsRepository.deleteBlog(id)
    },


    async deleteAllBlogs(): Promise<number> {
        return await blogsRepository.deleteAllBlogs()

    }
}

*/

/*async findBlogs(title: string | null | undefined): Promise<BlogType[]> {

    const filter: any = {}

    if (title) {
        filter.title = {$regex: title}
    }

    return blogsCollection.find((filter),{projection:{_id:0}}).toArray()
},


async findBlogById(id: string): Promise<BlogType | null> {
    let blog: BlogType | null = await blogsCollection.findOne({id: id},{projection:{_id:0}})
    if (blog) {
        return blog
    } else {
        return null
    }
},
*/
