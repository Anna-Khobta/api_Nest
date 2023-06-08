import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './functions/exception.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.setGlobalPrefix('sa-api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];

        errors.forEach((e) => {
          // errorsForResponse.push({ field: e.property });
          //const zeroKey = Object.keys(e.constraints)[0];
          const constaintsKeys = Object.keys(e.constraints);
          constaintsKeys.forEach((constKey) =>
            errorsForResponse.push({
              message: e.constraints[constKey],
              field: e.property,
            }),
          );
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(5007);
}
bootstrap();
