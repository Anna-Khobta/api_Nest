import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { deviceViewType, DeviceDBType } from '../blogs/types';
import { DeviceDb, DeviceDocument } from './device-schema';
import { JwtPayloadClass } from '../auth/auth-input-classes';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(DeviceDb.name) private tokenModel: Model<DeviceDocument>,
  ) {}

  async addToken(newRefTokenDb: DeviceDBType): Promise<boolean> {
    const tokenInstance: DeviceDocument = new this.tokenModel(newRefTokenDb);
    //upsert
    try {
      await tokenInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }

    /*
    const insertNewTokenToDb = await this.tokenModel.insertMany(newRefTokenDb);

    if (insertNewTokenToDb) return true;*/
  }

  async findToken(decodedRefreshToken: any): Promise<DeviceDBType | null> {
    const foundTokenInDb = await this.tokenModel.findOne(
      {
        userId: decodedRefreshToken.userId,
        iat: decodedRefreshToken.iat,
      },
      { projection: { _id: 0 } },
    );

    if (!foundTokenInDb) {
      return null;
    } else {
      return foundTokenInDb;
    }
  }

  async findAllDevices(findTokenInDb: DeviceDBType): Promise<deviceViewType[]> {
    const foundAllTokensInDb = await this.tokenModel
      .find(
        { userId: findTokenInDb.userId },
        {
          projection: {
            _id: 0,
            ip: 1,
            deviceTitle: 1,
            iat: 1,
            deviceId: 1,
          },
        },
      )
      .lean();

    const items: deviceViewType[] = foundAllTokensInDb.map((tokensInfo) => ({
      ip: tokensInfo.ip,
      title: tokensInfo.deviceTitle,
      lastActiveDate: new Date(tokensInfo.iat * 1000).toISOString(),
      deviceId: tokensInfo.deviceId,
    }));

    return items;
  }

  async findUserByDeviceId(deviceId: string): Promise<string | null> {
    const foundTokenInDb = await this.tokenModel.findOne({
      deviceId: deviceId,
    });

    if (foundTokenInDb) {
      return foundTokenInDb.userId;
    } else {
      return null;
    }
  }

  async updateToken(decodedRefreshToken: any, ip: string): Promise<boolean> {
    const result = await this.tokenModel.updateOne(
      {
        userId: decodedRefreshToken.userId,
        deviceId: decodedRefreshToken.deviceId,
      },
      {
        $set: {
          iat: decodedRefreshToken.iat,
          exp: decodedRefreshToken.exp,
          ip: ip,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async updateTokenIatExpIp(refreshToken: DeviceDBType): Promise<boolean> {
    const result = await this.tokenModel.updateOne(
      {
        userId: refreshToken.userId,
        deviceId: refreshToken.deviceId,
        deviceTitle: refreshToken.deviceTitle,
      },
      {
        $set: {
          iat: refreshToken.iat,
          exp: refreshToken.exp,
          ip: refreshToken.ip,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deleteToken(jwtPayload: JwtPayloadClass): Promise<boolean> {
    try {
      const result = await this.tokenModel.deleteOne({
        userId: jwtPayload.userId,
        deviceId: jwtPayload.deviceId,
        iat: jwtPayload.iat,
      });

      return result.deletedCount === 1;
    } catch (error) {
      console.log(error, 'Error in Db');
      return false;
    }
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.tokenModel.deleteOne({ deviceId: id });
    return result.deletedCount === 1;
  }

  async deleteAllExcludeOne(deviceId: string): Promise<boolean> {
    const result = await this.tokenModel.deleteMany({
      deviceId: { $ne: deviceId },
    });

    return result.acknowledged;
  }

  async deleteAllTokens(): Promise<boolean> {
    const result = await this.tokenModel.deleteMany({});
    return result.acknowledged;
    // если всё удалит, вернет true
  }
}
