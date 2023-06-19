import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeStatusesEnum } from '../types/types';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class CommentatorInfo {
  @Prop({
    required: true,
  })
  userId: string;
  @Prop({
    required: true,
  })
  @Prop()
  userLogin: string;
}

@Schema()
export class UsersEngagement {
  @Prop()
  userId: string;
  @Prop()
  createdAt: string;
  @Prop({
    required: true,
  })
  @Prop()
  userStatus: LikeStatusesEnum;
}

@Schema()
export class Comment {
  @Prop({
    required: true,
  })
  postId: string;
  @Prop({
    required: true,
  })
  content: string;
  @Prop({
    required: true,
  })
  createdAt: string;
  @Prop()
  commentatorInfo: CommentatorInfo;
  @Prop({
    required: true,
  })
  likesCount: number;
  @Prop({
    required: true,
  })
  dislikesCount: number;
  @Prop({ default: [] })
  usersEngagement: UsersEngagement[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
