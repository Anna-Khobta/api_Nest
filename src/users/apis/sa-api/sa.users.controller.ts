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
import { UsersService } from '../../users.service';
import { UsersQueryRepository } from '../../users-repositories/users.query.repository';
import { BasicAuthGuard } from '../../../auth-guards/basic-auth.guard';
import { CreateUserInputModel } from '../../input-models/create-user-input-model.dto';
import { CustomException } from '../../../functions/custom-exception';
import { isValid } from '../../../functions/isValid-Id';
import { CreateUserCommand } from './use-cases/create-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../input-models/ban-user-input-model.dto';
import { BanUserCommand } from './use-cases/ban-user-use-case';
import { QueryPaginationInputModel } from '../../../blogs/blogs-input-models/query-pagination-input-model.dto';

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

const messageWrong = 'Something wrong';

@Controller('sa/users')
export class SaUsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() inputModel: CreateUserInputModel) {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(inputModel, true),
    );

    if (createdUserId === 'login') {
      throw new CustomException(messageLogin, HttpStatus.BAD_REQUEST);
    }

    if (createdUserId === 'email') {
      throw new CustomException(messageEmail, HttpStatus.BAD_REQUEST);
    }

    if (!createdUserId) {
      throw new CustomException(messageWrong, HttpStatus.BAD_REQUEST);
    }

    return createdUserId;
    /*await this.usersQueryRepository.findUserById(createdUserId);*/

    /*const createdUserId = await this.usersService.createUser(inputModel, true);

    if (!createdUserId) {
      throw new CustomException('Something wrong', HttpStatus.BAD_REQUEST);
    }

    return await this.usersQueryRepository.findUserById(createdUserId);*/
  }
  @Get()
  @UseGuards(BasicAuthGuard)
  async getALLUsers(@Query() queryPagination: QueryPaginationInputModel) {
    const foundUsers = await this.usersQueryRepository.findUsers(
      queryPagination,
    );

    if (!foundUsers) {
      throw new CustomException(messageWrong, HttpStatus.BAD_REQUEST);
    }
    return foundUsers;
  }

  @Put(':id/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banUnbanUser(
    @Param('id') userId: string,
    @Body() inputModel: BanUserInputModel,
  ) {
    //isValid(userId);

    const updateBanUser = await this.commandBus.execute(
      new BanUserCommand(userId, inputModel),
    );

    if (!updateBanUser) {
      throw new CustomException(messageWrong, HttpStatus.BAD_REQUEST);
    }

    return updateBanUser;
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
