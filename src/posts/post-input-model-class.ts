import { IsEnum, IsMongoId, Length } from 'class-validator';
import { IsNotEmptyString } from '../decorators/IsNotEmptyString.validator';
import { LikeStatusesEnum } from '../blogs/types';
import { IsBlogExist } from '../decorators/BlogId.validator';

export class CreatePostInputModelClass {
  @Length(1, 30)
  @IsNotEmptyString()
  title: string;
  @Length(1, 100)
  @IsNotEmptyString()
  shortDescription: string;
  @Length(1, 1000)
  @IsNotEmptyString()
  content: string;
  @IsMongoId()
  @Length(24, 24)
  @IsBlogExist()
  blogId: string;
}

export class CreatePostForSpecialBlogInputModel {
  @Length(1, 30)
  @IsNotEmptyString()
  title: string;
  @Length(1, 100)
  @IsNotEmptyString()
  shortDescription: string;
  @Length(1, 1000)
  @IsNotEmptyString()
  content: string;
}

export class CreateCommentInputModelClass {
  @Length(20, 30)
  @IsNotEmptyString()
  content: string;
}

export class PostIdParamInputModel {
  postId: string;
}

export class LikeStatusInputModel {
  @IsNotEmptyString()
  @IsEnum(LikeStatusesEnum, { message: 'Invalid like status' })
  likeStatus: LikeStatusesEnum;
}
