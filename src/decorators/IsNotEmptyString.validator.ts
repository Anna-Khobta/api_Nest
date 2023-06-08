import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsNotEmptyString', async: true })
@Injectable()
export class IsNotEmptyStringValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    return typeof value === 'string' && value.trim() !== '';
  }

  defaultMessage(args: ValidationArguments) {
    return `This string should not be empty`;
  }
}

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotEmptyStringValidator,
    });
  };
}
