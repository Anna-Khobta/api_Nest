import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users-schema';
import { Model } from 'mongoose';
import { DeviceRepository } from './device.repository';
import { DeviceDBType } from '../blogs/types';
import { JwtPayloadClass } from '../auth/auth-input-classes';

@Injectable()
export class DeviceService {
  constructor(
    protected deviceRepository: DeviceRepository,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
  ) {}

  async createDeviceInfoInDB(
    decodedRefreshToken: any,
    ip: string,
    deviceTitle: string,
  ): Promise<boolean> {
    const newDeviceInfoFromRT: DeviceDBType = {
      iat: decodedRefreshToken.iat,
      exp: decodedRefreshToken.exp,
      deviceId: decodedRefreshToken.deviceId,
      deviceTitle: deviceTitle,
      ip: ip,
      userId: decodedRefreshToken.userId,
    };

    const addNewDeviceInfoToDb = await this.deviceRepository.addToken(
      newDeviceInfoFromRT,
    );
    return addNewDeviceInfoToDb;

    /*  так пока что не нужно в дз делать
    if (!checkDeviceInDb) {
      const addNewTokenToDb = await this.tokenRepository.addToken(
        newRefTokenDb,
      );
      return addNewTokenToDb;
    } else {
      const isUpdatedTokenInfoInDb =
        await this.tokenRepository.updateTokenIatExpIp(newRefTokenDb);
      return isUpdatedTokenInfoInDb;
    }*/
  }

  async updateDeviceInfoInDB(
    decodedRefreshToken: any,
    ip: string,
  ): Promise<boolean> {
    return await this.deviceRepository.updateToken(decodedRefreshToken, ip);
  }

  async deleteDeviceInfo(jwtPayload: JwtPayloadClass): Promise<boolean> {
    return await this.deviceRepository.deleteToken(jwtPayload);
  }

  async deleteDevice(
    deviceId: string,
    userId: string,
  ): Promise<boolean | string> {
    const foundUserByDeviceId = await this.deviceRepository.findUserByDeviceId(
      deviceId,
    );

    if (!foundUserByDeviceId) {
      return 'NotFound';
    }

    if (!(foundUserByDeviceId === userId)) {
      return 'NotOwn';
    }

    return await this.deviceRepository.deleteDevice(deviceId);
  }

  async deleteAllExcludeOne(deviceId: string): Promise<boolean> {
    return await this.deviceRepository.deleteAllExcludeOne(deviceId);
  }
}
