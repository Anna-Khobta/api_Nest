import { IsNotEmptyString } from '../decorators/IsNotEmptyString.validator';
import { IsEnum, IsString, Length } from 'class-validator';
import { LikeStatusesEnum } from '../blogs/types';

export class UpdateCommentInputModel {
  @IsNotEmptyString()
  @IsString()
  @Length(20, 300)
  content: string;
}

export class MakeLikeInputModel {
  @IsNotEmptyString()
  @IsEnum(LikeStatusesEnum)
  likeStatus: LikeStatusesEnum;
}
