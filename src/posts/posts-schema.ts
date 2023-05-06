import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserLikeInfo } from '../blogs/types';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  shortDescription: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  blogId: string;

  @Prop({
    required: true,
  })
  blogName: string;
  @Prop({
    required: true,
  })
  createdAt: string;
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  f;
  @Prop()
  usersEngagement: UserLikeInfo[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
