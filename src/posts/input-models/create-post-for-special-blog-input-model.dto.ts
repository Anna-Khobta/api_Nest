import { Length } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';

export class CreatePostForSpecialBlogInputModelDto {
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
