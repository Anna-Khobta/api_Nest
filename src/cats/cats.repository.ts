import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument } from './cats-schema';

@Injectable()
export class CatsRepository {
  constructor(@InjectModel(Cat.name) private catModel: Model<CatDocument>) {}

  async create(createCatDto: any): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<CatDocument[]> {
    return this.catModel.find().exec();
  }

  async save(cat: CatDocument) {
    await cat.save();
  }
}
