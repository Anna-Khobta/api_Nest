import { HttpException, HttpStatus } from '@nestjs/common';
export class CustomException extends HttpException {
  constructor(message: any, status: HttpStatus) {
    super(message, status);
  }
}
