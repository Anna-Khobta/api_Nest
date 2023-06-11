import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';
import { IsString, Length } from 'class-validator';

export class UpdateCommentInputModelDto {
  @IsNotEmptyString()
  @IsString()
  @Length(20, 300)
  content: string;
}
