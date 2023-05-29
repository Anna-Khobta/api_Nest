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
  HttpCode,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CustomException } from '../blogs/functions/custom-exception';
import { AuthService } from './auth.service';
import { DeviceService } from '../token/device.service';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import { Response } from 'express';
import { CreateUserInputModelType } from '../users/users.controller';
import { EmailsManager } from '../managers/emails-manager';
import { JwtPayload } from '../decorators/current-cookies.param.decorator';
import { JwtRefreshGuard } from '../auth-guards/jwt-refresh.guard';
import { RecoveryCodeGuard } from '../auth-guards/recoveryCode.guard';

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
    protected deviceService: DeviceService,
    protected emailsManager: EmailsManager,
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

    const loginUser = await this.authService.getTokens(
      foundUserInDb._id.toString(),
    );

    await this.deviceService.createDeviceInfoInDB(
      loginUser.decodedRefreshToken,
      ip,
      deviceTitle,
    );

    response.cookie('refreshToken', loginUser.refreshToken);
    return { accessToken: loginUser.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async getInfoAboutMeUser(@CurrentUserId() currentUserId: string) {
    const meUser = await this.usersQueryRepository.findUserById(currentUserId);

    return {
      userId: meUser?.id,
      login: meUser?.login,
      email: meUser?.email,
    };
  }

  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() inputModel: CreateUserInputModelType) {
    const newUserId = await this.usersService.createUser(inputModel, false);

    const userConfirmationCode =
      await this.usersQueryRepository.findUserInfoForEmailSend(newUserId);

    try {
      const sendEmail = await this.emailsManager.sendEmailConfirmationMessage(
        userConfirmationCode!.id,
        userConfirmationCode!.email,
        userConfirmationCode!.confirmationCode,
      );
      return true;
    } catch (error) {
      console.log(error);
      throw new CustomException(
        'Something went wrong with sending a email',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body() inputCode: string) {
    const isEmailConfirmed = await this.authService.confirmEmail(inputCode);
    if (!isEmailConfirmed) {
      throw new CustomException(
        {
          errorsMessages: [
            { message: 'Incorrect code or it was already used', field: 'code' },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return true;
    }
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() email: string) {
    const foundUserByEmail =
      await this.usersQueryRepository.findUserByLoginOrEmail(null, email);

    if (!foundUserByEmail) {
      throw new CustomException(
        {
          errorsMessages: [
            {
              errorsMessages: [
                { message: 'Your email was already confirmed', field: 'email' },
              ],
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const resendEmail = await this.emailsManager.resendEmailConfirmationMessage(
      foundUserByEmail,
    );
    if (!resendEmail) {
      throw new CustomException(
        {
          errorsMessages: [
            { message: 'Some problems with email send', field: 'email' },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  async createNewTokens(
    @Ip() ip: string,
    @JwtPayload() jwtPayload: JwtPayloadType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const createNewTokens = await this.authService.createNewAccessRefreshTokens(
      jwtPayload.userId,
      jwtPayload.deviceId,
    );
    await this.deviceService.updateDeviceInfoInDB(
      createNewTokens.decodedRefreshToken,
      ip,
    );

    response.cookie('refreshToken', createNewTokens.refreshToken);
    return { accessToken: createNewTokens.accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtRefreshGuard)
  async logoutUser(@Ip() ip: string, @JwtPayload() jwtPayload: JwtPayloadType) {
    const isTokenDeleted = await this.deviceService.deleteDeviceInfo(
      jwtPayload,
    );

    return true;
  }
  @Post('password-recovery')
  @HttpCode(204)
  async emailPasswordRecovery(@Body() email: string) {
    const result = await this.authService.checkEmailPassRecov(email);
    if (!result) {
      throw new CustomException('Something went wrong', HttpStatus.BAD_REQUEST);
    } else {
      return true;
    }
  }
  @Post('new-password')
  @UseGuards(RecoveryCodeGuard)
  async createNewPassword(@Body() inputModel: CreateNewPassInputModel) {
    const result = await this.authService.updatePassword(
      inputModel.newPassword,
      inputModel.recoveryCode,
    );

    if (!result) {
      throw new CustomException(
        {
          errorsMessages: [
            {
              message: 'Incorrect recoveryCode or it was already used',
              field: 'code',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return true;
    }
  }
}

export type JwtPayloadType = {
  iat: number;
  exp: number;
  deviceId: string;
  userId: string;
};

export type CreateNewPassInputModel = {
  newPassword: string;
  recoveryCode: string;
};
