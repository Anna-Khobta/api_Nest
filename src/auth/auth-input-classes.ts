import { IsEmail, IsString, Length } from 'class-validator';

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

export class inputCodeType {
  @IsString()
  code: string;
}

export class inputModelEmail {
  @IsEmail()
  email: string;
}
