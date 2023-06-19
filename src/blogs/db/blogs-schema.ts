import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class BlogOwnerInfo {
  @Prop({
    //required: true,
    type: SchemaTypes.Mixed,
  })
  userId: string | null;
  @Prop({
    //required: true,
    type: SchemaTypes.Mixed,
  })
  userLogin: string | null;
}

@Schema()
export class BlogBanInfoClass {
  @Prop({
    required: true,
  })
  isBanned: boolean;
  @Prop({ type: SchemaTypes.Mixed })
  banDate: Date | null;
}

@Schema()
export class UsersWereBanned {
  @Prop()
  userId: string;
  @Prop()
  isBanned: boolean;
  @Prop()
  banReason: string | null;
  @Prop({ type: SchemaTypes.Mixed })
  banDate: Date | null;
}

@Schema()
export class Blog {
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

  @Prop({
    required: true,
  })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop({
    required: true,
  })
  banInfo: BlogBanInfoClass;
  @Prop({
    required: true,
    default: [],
  })
  usersWerBanned: UsersWereBanned[];

  setName(newName1: string) {
    this.name = newName1;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
