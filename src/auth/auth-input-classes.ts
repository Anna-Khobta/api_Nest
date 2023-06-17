import { IsEmail, IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../decorators/IsNotEmptyString.validator';

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

export class LoginUserInputModelType {
  @IsString()
  @IsNotEmptyString()
  @Length(3)
  loginOrEmail: string;
  @Length(6, 20)
  @IsNotEmptyString()
  password: string;
}
