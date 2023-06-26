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
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { CustomException } from '../functions/custom-exception';
import { AuthService } from './auth.service';
import { DeviceService } from '../devices/device.service';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import { Response } from 'express';
import { EmailsManager } from '../managers/emails-manager';
import { JwtRefreshGuard } from '../auth-guards/jwt-refresh.guard';
import { RecoveryCodeGuard } from '../auth-guards/recoveryCode.guard';
import {
  CreateNewPassInputModel,
  inputCodeType,
  inputModelEmail,
  JwtPayloadClass,
  LoginUserInputModelType,
} from './auth-input-classes';
import { CreateUserInputModel } from '../users/input-models/create-user-input-model.dto';
import { JwtPayload } from '../decorators/JwtPayload.param.decorator';
import { IfRefreshTokenInDbGuard } from '../auth-guards/if.Refresh.Token.In.Db.guard';
import { LoginPasswordGuard } from '../auth-guards/login-password.guard';
import {
  customMessageEmail,
  customMessageLogin,
  customMessageRecoveryCode,
} from '../functions/customMessageErrors/custom-messages';

const httpOnlyTrue = {
  httpOnly: true,
  secure: true,
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
  //@UseGuards(IpLimitGuard)
  @UseGuards(LoginPasswordGuard)
  async loginUser(
    @Headers('user-agent') deviceTitle: string,
    @Body() inputModel: LoginUserInputModelType,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUserId() currentUserId: string,
  ) {
    const loginUser = await this.authService.getTokens(currentUserId);

    await this.deviceService.createDeviceInfoInDB(
      loginUser.decodedRefreshToken,
      ip,
      deviceTitle,
    );

    response.cookie('refreshToken', loginUser.refreshToken, httpOnlyTrue);
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
  //@UseGuards(IpLimitGuard)
  @HttpCode(204)
  async registerUser(@Body() inputModel: CreateUserInputModel) {
    const newUserId = await this.usersService.createUser(inputModel, false);

    if (newUserId === 'login') {
      throw new CustomException(customMessageLogin, HttpStatus.BAD_REQUEST);
    }
    if (newUserId === 'email') {
      {
        throw new CustomException(customMessageEmail, HttpStatus.BAD_REQUEST);
      }
    }
    return await this.authService.emailSending(newUserId);
  }

  @Post('registration-confirmation')
  //@UseGuards(IpLimitGuard)
  @HttpCode(204)
  async confirmRegistration(@Body() inputCode: inputCodeType) {
    const isEmailConfirmed = await this.authService.confirmEmail(
      inputCode.code,
    );

    if (!isEmailConfirmed) {
      throw new CustomException(
        customMessageRecoveryCode,
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  //@UseGuards(IpLimitGuard)
  async resendEmail(@Body() email: inputModelEmail) {
    const foundUserByEmail = await this.authService.checkUserByLoginOrEmail(
      null,
      email.email,
    );

    if (
      !foundUserByEmail ||
      foundUserByEmail.emailConfirmation.isConfirmed === true
    ) {
      throw new CustomException(customMessageEmail, HttpStatus.BAD_REQUEST);
    }

    const resendEmail = await this.authService.emailResending(foundUserByEmail);
    if (!resendEmail) {
      throw new CustomException(customMessageEmail, HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard, IfRefreshTokenInDbGuard)
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

    response.cookie('refreshToken', createNewTokens.refreshToken, httpOnlyTrue);
    return { accessToken: createNewTokens.accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtRefreshGuard, IfRefreshTokenInDbGuard)
  async logoutUser(
    @Ip() ip: string,
    @JwtPayload() jwtPayload: JwtPayloadClass,
  ) {
    return await this.deviceService.deleteDeviceInfo(jwtPayload);
  }
  @Post('password-recovery')
  @HttpCode(204)
  async emailPasswordRecovery(@Body() email: string) {
    const result = await this.authService.checkEmailPassRecov(email);
    if (!result) {
      throw new CustomException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
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
        customMessageRecoveryCode,
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
