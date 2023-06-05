import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/repositories/blogs.query.repository';

@ValidatorConstraint({ name: 'isBlogIdExistInBase', async: true })
@Injectable()
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(protected blogsQueryRepository: BlogsQueryRepository) {}
  async validate(value: any) {
    try {
      const foundBlog = await this.blogsQueryRepository.findBlogByIdViewModel(
        value,
      );
      if (foundBlog) {
        return true;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `No such blogId in Db`;
  }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isBlogIdExistInBase',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIdValidator,
    });
  };
}
