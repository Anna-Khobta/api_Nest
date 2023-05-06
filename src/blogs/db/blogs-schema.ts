import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  /*  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  _id: Types.ObjectId;*/

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  description: string;

  @Prop({
    required: true,
  })
  websiteUrl: string;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
  })
  isMembership: boolean;

  setName(newName: string) {
    this.name = newName;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
