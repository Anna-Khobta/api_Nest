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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';
import { CustomException } from '../blogs/functions/custom-exception';
import { QueryPaginationType } from '../blogs/blogs.controller';
import { isValid } from '../blogs/functions/isValid-Id';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Post()
  @HttpCode(201)
  async createUser(@Body() inputModel: CreateUserInputModelType) {
    const isUserRegisteredInDb =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        inputModel.login,
        inputModel.email,
      );

    if (isUserRegisteredInDb) {
      throw new CustomException('user cant be created', HttpStatus.BAD_REQUEST);
    }

    const createdUserId = await this.usersService.createUser(inputModel, true);

    if (!createdUserId) {
      throw new CustomException('user cant be created', HttpStatus.BAD_REQUEST);
    }

    const userView = await this.usersQueryRepository.findUserById(
      createdUserId,
    );
    return userView;
  }
  @Get()
  async getALLUsers(@Query() queryPagination: QueryPaginationType) {
    const foundUsers = await this.usersQueryRepository.findUsers(
      queryPagination,
    );
    if (!foundUsers) {
      throw new CustomException('Somethig went wrong', HttpStatus.BAD_REQUEST);
    }
    return foundUsers;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string) {
    isValid(id);
    const isDeleted = await this.usersService.deleteUser(id);
    if (!isDeleted) {
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    }
    return;
  }
}

export type CreateUserInputModelType = {
  login: string;
  password: string;
  email: string;
};
