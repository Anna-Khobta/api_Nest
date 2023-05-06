import { ObjectId } from 'mongodb';
import { CustomException } from './custom-exception';
import { HttpStatus } from '@nestjs/common';

export const isValid = (blogId: string | null) => {
  if (!ObjectId.isValid(blogId)) {
    throw new CustomException('Blog not found', HttpStatus.NOT_FOUND);
  }
};
