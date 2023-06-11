import { IsEnum } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';
import { LikeStatusesEnum } from '../../types/types';

export class LikeStatusInputModel {
  @IsNotEmptyString()
  @IsEnum(LikeStatusesEnum, { message: 'Invalid like status' })
  likeStatus: LikeStatusesEnum;
}
