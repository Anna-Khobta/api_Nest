import { IsEmail, Length } from 'class-validator';

export class CreateUserInputModel {
  @Length(3, 10)
  //@Validate(IsLoginAlreadyExist)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail()
  //@Validate(IsEmailAlreadyExist)
  email: string;
}
