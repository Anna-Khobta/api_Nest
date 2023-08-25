import { Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { DeviceDBType } from '../types/types';
import { JwtPayloadClass } from '../auth/auth-input-classes';

@Injectable()
export class DeviceService {
  constructor(protected deviceRepository: DeviceRepository) {}

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

    return await this.deviceRepository.addToken(newDeviceInfoFromRT);

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

  async deleteAllExcludeOne(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    return await this.deviceRepository.deleteAllExcludeOne(deviceId, userId);
  }
}
