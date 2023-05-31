import { Length } from 'class-validator';

export class JwtPayloadClass {
  iat: number;
  exp: number;
  deviceId: string;
  userId: string;
}

export class CreateNewPassInputModel {
  @Length(6, 20)
  newPassword: string;
  recoveryCode: string;
}
