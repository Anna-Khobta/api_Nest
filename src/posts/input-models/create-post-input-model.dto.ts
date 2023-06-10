import { IsMongoId, Length } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';
import { IsBlogExist } from '../../decorators/BlogId.validator';

export class CreatePostInputModel {
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
