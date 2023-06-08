import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';

@ValidatorConstraint({ name: 'LoginExist', async: true })
@Injectable()
export class IsLoginAlreadyExist implements ValidatorConstraintInterface {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async validate(login: string) {
    try {
      const foundUser = await this.usersQueryRepository.findUserByLoginOrEmail(
        login,
        null,
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  defaultMessage(args: ValidationArguments) {
    return `This login was already registered`;
  }
}

// TODO положить в модуль
