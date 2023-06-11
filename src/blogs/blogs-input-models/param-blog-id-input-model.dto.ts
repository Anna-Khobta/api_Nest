import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';
import { IsMongoId, Length } from 'class-validator';
import { IsBlogExist } from '../../decorators/BlogId.validator';

export class ParamBlogIdInputModel {
  @IsNotEmptyString()
  @IsMongoId()
  @Length(24, 24)
  @IsBlogExist()
  blogId: string;
}
