import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
  Headers,
  Res,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CustomException } from '../blogs/functions/custom-exception';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { JwtAuthGuard } from '../auth-guards/jwt-auth.guard';
import { Response } from 'express';

export type LoginUserInputModelType = {
  loginOrEmail: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    protected authService: AuthService,
    protected tokenService: TokenService,
  ) {}

  @Post('login')
  async loginUser(
    @Headers('user-agent') deviceTitle: string,
    @Body() inputModel: LoginUserInputModelType,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const foundUserInDb =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        inputModel.loginOrEmail,
        inputModel.loginOrEmail,
      );

    if (!foundUserInDb) {
      throw new CustomException('No such user in app', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordCorrect = await this.usersService.checkPasswordCorrect(
      foundUserInDb.accountData.hashPassword,
      inputModel.password,
    );

    if (!isPasswordCorrect) {
      throw new CustomException(
        'Incorrect login or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const loginUser = await this.authService.login(
      foundUserInDb._id.toString(),
    );

    const isTokenAddedToDb = await this.tokenService.createTokenDB(
      loginUser.decodedRefreshToken,
      ip,
      deviceTitle,
    );

    response.cookie('refreshToken', loginUser.refreshToken);
    return { accessToken: loginUser.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getInfoAboutMeUser(@CurrentUserId() currentUserId: string) {
    const meUser = await this.usersQueryRepository.findUserById(currentUserId);

    return {
      userId: meUser?.id,
      login: meUser?.login,
      email: meUser?.email,
    };
  }
}
