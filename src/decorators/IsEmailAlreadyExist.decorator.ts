import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';

@Injectable()
export class IsEmailAlreadyExist implements ValidatorConstraintInterface {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validate(email: string) {
    const foundUser = await this.usersQueryRepository.findUserByLoginOrEmail(
      null,
      email,
    );

    if (!foundUser) {
      return true;
    }
    return false;
  }
  defaultMessage(args: ValidationArguments) {
    return `This email was already registered`;
  }
}
