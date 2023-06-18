import { IsBoolean, Length } from 'class-validator';
import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';

export class BanUserByBlogerInputModel {
  @IsBoolean()
  isBanned: boolean;
  @Length(20)
  banReason: string;
  @IsNotEmptyString()
  @Length(24, 24)
  blogId: string;
}
