import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class CatToy {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  price: number;
}

export const CatToySchema = SchemaFactory.createForClass(CatToy);

@Schema()
export class Cat {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  _id: Types.ObjectId;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  age: number;

  @Prop({
    required: true,
  })
  breed: string;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: [], type: [CatToySchema] })
  toys: CatToy[];

  setAge(newAge: number) {
    if (newAge < 0) throw new Error('Bad age');
    this.age = newAge;
  }
}

export const CatSchema = SchemaFactory.createForClass(Cat);
