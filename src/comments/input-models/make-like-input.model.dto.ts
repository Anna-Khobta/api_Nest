import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';
import { IsEnum } from 'class-validator';
import { LikeStatusesEnum } from '../../types/types';

export class MakeLikeInputModelDto {
  @IsNotEmptyString()
  @IsEnum(LikeStatusesEnum)
  likeStatus: LikeStatusesEnum;
}
