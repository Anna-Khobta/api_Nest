import { HydratedDocument, Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { InjectModel } from '@nestjs/mongoose';

export class BlogsDbRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async save(blogInstance: BlogDocument): Promise<boolean> {
    try {
      await blogInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
/*
    async createBlog(newBlog: BlogType): Promise<BlogType | null> {

        await BlogModelClass.create(newBlog)
        return BlogModelClass.findOne({id: newBlog.id}, {_id: 0, __v: 0}).lean() ;
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string ): Promise<boolean> {

        const result = await BlogModelClass.updateOne({id: id}, {$set: {name: name, description:description, websiteUrl:websiteUrl  }})
        return result.matchedCount === 1

    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await BlogModelClass.findOneAndDelete({id: id})
        return result !== null;
        //  If the deleted document exists, we return true, otherwise, we return false.
    },


    async deleteAllBlogs(): Promise<number> {
        const result = await BlogModelClass.deleteMany({})
        return result.deletedCount
    }
}



*/
