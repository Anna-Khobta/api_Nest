import { Length } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';

export class CreateCommentInputModelDto {
  @Length(20, 30)
  @IsNotEmptyString()
  content: string;
}
