import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users-repositories/users.query.repository';
import { CustomException } from '../functions/custom-exception';
import { isValid } from '../functions/isValid-Id';
import { BasicAuthGuard } from '../auth-guards/basic-auth.guard';
import { CreateUserInputModelClass } from './users-input-model-class';
import { QueryPaginationInputModelClass } from '../blogs/db/blogs-input-classes';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() inputModel: CreateUserInputModelClass) {
    const isUserRegisteredInDb =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        inputModel.login,
        inputModel.email,
      );

    if (isUserRegisteredInDb) {
      if (isUserRegisteredInDb.accountData.login === inputModel.login) {
        throw new CustomException(
          {
            errorsMessages: [
              {
                message: 'This login or email is already exist ',
                field: 'login',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (isUserRegisteredInDb.accountData.email === inputModel.email) {
        throw new CustomException(
          {
            errorsMessages: [
              {
                message: 'This login or email is already exist ',
                field: 'email',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const createdUserId = await this.usersService.createUser(inputModel, true);

    if (!createdUserId) {
      throw new CustomException(
        {
          errorsMessages: [
            {
              message: 'This login or email is already exist ',
              field: 'login',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.usersQueryRepository.findUserById(createdUserId);
  }
  @Get()
  @UseGuards(BasicAuthGuard)
  async getALLUsers(@Query() queryPagination: QueryPaginationInputModelClass) {
    const foundUsers = await this.usersQueryRepository.findUsers(
      queryPagination,
    );
    if (!foundUsers) {
      throw new CustomException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
    return foundUsers;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deleteUserById(@Param('id') id: string) {
    isValid(id);
    const isDeleted = await this.usersService.deleteUser(id);
    if (!isDeleted) {
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    }
    return;
  }
}
