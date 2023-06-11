import { IsNotEmptyString } from '../../decorators/IsNotEmptyString.validator';

export class ParamUserIdInputModel {
  @IsNotEmptyString()
  userId: string;
}
