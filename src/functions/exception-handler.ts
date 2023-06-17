import { HttpException } from '@nestjs/common';

export enum ResultCode {
  Success,
  Unauthorized,
  NotFound,
  Forbidden,
  BadRequest,
}

export type ExceptionCodesType = {
  code: ResultCode;
};

export type SuccesCodeType = {
  data: any;
  code: ResultCode;
};

export const exceptionHandler = (code: ResultCode, data?: any) => {
  switch (code) {
    case ResultCode.Unauthorized:
      throw new HttpException('Unauthorized', 401);
    case ResultCode.NotFound:
      throw new HttpException('Not Found', 404);
    case ResultCode.Forbidden:
      throw new HttpException('Forbidden', 404);
    case ResultCode.BadRequest:
      throw new HttpException(data, 400);

    default:
      return;
  }
};
