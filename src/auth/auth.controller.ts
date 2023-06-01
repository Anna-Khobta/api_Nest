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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { CustomException } from '../functions/custom-exception';
import { AuthService } from './auth.service';
import { DeviceService } from '../devices/device.service';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import { Response } from 'express';
import { EmailsManager } from '../managers/emails-manager';
import { JwtPayload } from '../decorators/current-cookies.param.decorator';
import { JwtRefreshGuard } from '../auth-guards/jwt-refresh.guard';
import { RecoveryCodeGuard } from '../auth-guards/recoveryCode.guard';
import {
  CreateNewPassInputModel,
  inputCodeType,
  inputModelEmail,
  JwtPayloadClass,
} from './auth-input-classes';
import { CreateUserInputModelClass } from '../users/users-input-model-class';

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
  @HttpCode(200)
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
  async registerUser(@Body() inputModel: CreateUserInputModelClass) {
    const newUserId = await this.usersService.createUser(inputModel, false);

    if (newUserId === 'login') {
      throw new CustomException(
        {
          errorsMessages: [
            {
              message: 'This login is already exist ',
              field: 'login',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newUserId === 'email') {
      {
        throw new CustomException(
          {
            errorsMessages: [
              {
                message: 'This email is already exist ',
                field: 'email',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const userConfirmationCode =
      await this.usersQueryRepository.findUserInfoForEmailSend(newUserId);

    try {
      await this.emailsManager.sendEmailConfirmationMessage(
        userConfirmationCode!.id,
        userConfirmationCode!.email,
        userConfirmationCode!.confirmationCode,
      );
      return true;
    } catch (error) {
      console.log(error);
      throw new BadRequestException([
        { message: 'Something went wrong with email sending', field: 'email' },
      ]);
    }
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body() inputCode: inputCodeType) {
    const isEmailConfirmed = await this.authService.confirmEmail(
      inputCode.code,
    );

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
  async resendEmail(@Body() email: inputModelEmail) {
    // TODO проверку перенести в сервис  ?
    const foundUserByEmail =
      await this.usersQueryRepository.findUserByLoginOrEmail(null, email.email);

    if (!foundUserByEmail) {
      throw new CustomException(
        {
          errorsMessages: [
            { message: "Such email doesn't exist", field: 'email' },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (foundUserByEmail.emailConfirmation.isConfirmed === true) {
      throw new CustomException(
        {
          errorsMessages: [
            { message: 'This email was already confirmed', field: 'email' },
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

  @Post('refresh-devices')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  async createNewTokens(
    @Ip() ip: string,
    @JwtPayload() jwtPayload: JwtPayloadClass,
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
  async logoutUser(
    @Ip() ip: string,
    @JwtPayload() jwtPayload: JwtPayloadClass,
  ) {
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
