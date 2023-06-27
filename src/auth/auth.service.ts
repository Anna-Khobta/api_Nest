import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { EmailsManager } from '../managers/emails-manager';
import { UsersRepository } from '../users/users-repositories/users.repository';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { ConfigService } from '@nestjs/config';
import { DeviceRepository } from '../devices/device.repository';
import { UserWithMongoId } from '../types/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    protected emailsManager: EmailsManager,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    private configService: ConfigService,
    protected deviceRepository: DeviceRepository,
  ) {}

  async getTokens(id: string) {
    const accessToken = this.jwtService.sign(
      { userId: id },
      { expiresIn: this.configService.get('ACCESS_TOKEN_LIFE_TIME') },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId: id,
        deviceId: uuidv4(),
      },
      { expiresIn: this.configService.get('REFRESH_TOKEN_LIFE_TIME') },
    );

    const decodedRefreshToken = this.jwtService.decode(refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      decodedRefreshToken: decodedRefreshToken,
    };
  }

  async confirmEmail(code: string): Promise<boolean> {
    const foundUserByCode =
      await this.usersQueryRepository.findUserByConfirmationCode(code);

    if (!foundUserByCode) return false;

    if (
      foundUserByCode.emailConfirmation.confirmationCode === code &&
      foundUserByCode.emailConfirmation.expirationDate > new Date() &&
      foundUserByCode.emailConfirmation.isConfirmed === false
    ) {
      await this.usersRepository.updateConfirmation(
        foundUserByCode._id.toString(),
      );
      return true;
    }
    return false;
  }

  async checkEmailPassRecov(email: string): Promise<boolean> {
    const foundUserByEmail =
      await this.usersQueryRepository.findUserByLoginOrEmail(null, email);

    if (!foundUserByEmail) return true;

    const generatePassRecovCode = uuidv4();
    const generatePassRecovCodeExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 2,
    });

    await this.usersRepository.updatePasswordRecoveryCode(
      foundUserByEmail._id.toString(),
      generatePassRecovCode,
      generatePassRecovCodeExpirationDate,
    );

    try {
      await this.emailsManager.sendEmailPasswordRecovery(
        generatePassRecovCode,
        email,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updatePassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<string | null> {
    const foundUserByCode =
      await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode);

    if (!foundUserByCode) {
      return null;
    }

    return await this.usersRepository.updatePassword(
      foundUserByCode._id.toString(),
      newPassword,
    );
  }

  async createNewAccessRefreshTokens(userId: string, deviceId: string) {
    //const decodedRefreshToken = this.jwtService.decode(refreshToken);

    const newAccessToken = this.jwtService.sign(
      { userId: userId },
      { expiresIn: this.configService.get('ACCESS_TOKEN_LIFE_TIME') },
    );
    const newRefreshToken = this.jwtService.sign(
      {
        userId: userId,
        deviceId: deviceId,
      },
      { expiresIn: this.configService.get('REFRESH_TOKEN_LIFE_TIME') },
    );
    const newDecodedRefreshToken = this.jwtService.decode(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      decodedRefreshToken: newDecodedRefreshToken,
    };
  }

  async ifTokenInfoInDb(jwtPayload: any): Promise<boolean> {
    const foundRefreshTokenInDb = await this.deviceRepository.findToken(
      jwtPayload,
    );
    if (!foundRefreshTokenInDb) {
      return false;
    }
    return true;
  }

  async checkUserByLoginOrEmail(login: string | null, email: string | null) {
    return await this.usersRepository.findUserByLoginOrEmail(login, email);
  }
  async emailSending(newUserId: string) {
    const userConfirmationCode =
      await this.usersRepository.findUserInfoForEmailSend(newUserId);

    try {
      // в сервис
      await this.emailsManager.sendEmailConfirmationMessage(
        userConfirmationCode!.id,
        userConfirmationCode!.email,
        userConfirmationCode!.confirmationCode,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async emailResending(foundUserByEmail: UserWithMongoId) {
    return await this.emailsManager.resendEmailConfirmationMessage(
      foundUserByEmail,
    );
  }
}
