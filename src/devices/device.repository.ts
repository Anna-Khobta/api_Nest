import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { deviceViewType, DeviceDBType } from '../blogs/types';
import { DeviceDb, DeviceDocument } from './device-schema';
import { JwtPayloadClass } from '../auth/auth-input-classes';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(DeviceDb.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async addToken(newRefTokenDb: DeviceDBType): Promise<boolean> {
    const tokenInstance: DeviceDocument = new this.deviceModel(newRefTokenDb);
    //upsert
    try {
      await tokenInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }

    /*
    const insertNewTokenToDb = await this.deviceModel.insertMany(newRefTokenDb);
    if (insertNewTokenToDb) return true;*/
  }

  async findToken(
    decodedRefreshToken: JwtPayloadClass,
  ): Promise<DeviceDBType | null> {
    try {
      const foundTokenInDb = await this.deviceModel.findOne(
        {
          userId: decodedRefreshToken.userId,
          deviceId: decodedRefreshToken.deviceId,
          iat: decodedRefreshToken.iat,
        },
        { projection: { _id: 0 } },
      );

      if (!foundTokenInDb) {
        return null;
      } else {
        return foundTokenInDb;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findAllDevices(userId: string): Promise<deviceViewType[] | null> {
    try {
      const foundAllTokensInDb = await this.deviceModel
        .find(
          { userId: userId },
          {
            projection: {
              _id: 0,
              //ip: 1,
              //deviceTitle: 1,
              //iat: 1,
              //deviceId: 1,
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
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findUserByDeviceId(deviceId: string): Promise<string | null> {
    const foundTokenInDb = await this.deviceModel.findOne({
      deviceId: deviceId,
    });

    if (foundTokenInDb) {
      return foundTokenInDb.userId;
    } else {
      return null;
    }
  }

  async updateToken(decodedRefreshToken: any, ip: string): Promise<boolean> {
    const result = await this.deviceModel.updateOne(
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
    const result = await this.deviceModel.updateOne(
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
      const result = await this.deviceModel.deleteOne({
        userId: jwtPayload.userId,
        deviceId: jwtPayload.deviceId,
        iat: jwtPayload.iat,
      });

      return result.deletedCount === 1;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({ deviceId: id });
    return result.deletedCount === 1;
  }

  async deleteAllExcludeOne(deviceId: string): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      deviceId: { $ne: deviceId },
    });
    return result.acknowledged;
  }

  async deleteAllTokens(): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({});
    return result.acknowledged;
    // если всё удалит, вернет true
  }
}
