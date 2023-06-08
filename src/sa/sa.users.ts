import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { BasicAuthGuard } from '../auth-guards/basic-auth.guard';
import { CreateUserInputModelClass } from '../users/users-input-model-class.dto';
import { CustomException } from '../functions/custom-exception';
import { QueryPaginationInputModelClass } from '../blogs/db/blogs-input-classes';
import { isValid } from '../functions/isValid-Id';

@Controller('sa/users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() inputModel: CreateUserInputModelClass) {
    const checkUserIsAlreadyInDb = await this.usersService.checkUserExist(
      inputModel.login,
      inputModel.email,
    );

    const messageLogin = {
      errorsMessages: [
        {
          message: 'This login is already exist ',
          field: 'login',
        },
      ],
    };

    const messageEmail = {
      errorsMessages: [
        {
          message: 'This email is already exist ',
          field: 'email',
        },
      ],
    };

    if (checkUserIsAlreadyInDb === 'login') {
      throw new CustomException(messageLogin, HttpStatus.BAD_REQUEST);
    }

    if (checkUserIsAlreadyInDb === 'email') {
      throw new CustomException(messageEmail, HttpStatus.BAD_REQUEST);
    }

    const createdUserId = await this.usersService.createUser(inputModel, true);

    if (!createdUserId) {
      throw new CustomException('Something wrong', HttpStatus.BAD_REQUEST);
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

  @Put(':id/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banUnbanUser(@Param('id') id: string) {
    isValid(id);
    const isDeleted = await this.usersService.deleteUser(id);
    if (!isDeleted) {
      throw new CustomException('User not found', HttpStatus.NOT_FOUND);
    }
    return;
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
