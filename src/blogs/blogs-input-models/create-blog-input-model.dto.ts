import { IsString, IsUrl, Length } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';

export class CreateBlogInputModel {
  //@Trim() почему-то не сработало
  //@IsNotEmpty()
  @IsNotEmptyString()
  @IsString()
  @Length(3, 15)
  name: string;
  @IsString()
  @IsNotEmptyString()
  @Length(3, 500)
  description: string;
  @Length(3, 100)
  @IsUrl()
  websiteUrl: string;
}
