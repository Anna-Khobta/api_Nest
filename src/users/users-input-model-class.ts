import { IsEmail, Length, Validate } from 'class-validator';
import { IsEmailAlreadyExist } from '../decorators/IsEmailAlreadyExist.decorator';
import { IsLoginAlreadyExist } from '../decorators/IsLoginAlreadyExist.validator';

export class CreateUserInputModelClass {
  @Length(3, 10)
  //@Validate(IsLoginAlreadyExist)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail()
  //@Validate(IsEmailAlreadyExist)
  email: string;
}
