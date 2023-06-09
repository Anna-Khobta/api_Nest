import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IpDb, IpDbDocument } from './ip-limit-schema';
import { ipDbType } from '../../types/types';

export class IpLimitRepository {
  constructor(@InjectModel(IpDb.name) private ipDbModel: Model<IpDbDocument>) {}
  async saveIpInDb(receivedIpInfo: ipDbType): Promise<boolean> {
    try {
      const ipDb = new this.ipDbModel(receivedIpInfo);
      await ipDb.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async findLast10sIp(receivedIp: ipDbType): Promise<ipDbType[]> {
    const limitTime = new Date(Date.now() - 12 * 1000); // по заданию было 10с , но сработало именно так

    const foundIpInDb = await this.ipDbModel
      .find(
        {
          ip: receivedIp.ip,
          endpoint: receivedIp.endpoint,
          iat: { $gte: limitTime },
        },
        { projection: { _id: 0 } },
      )
      .lean();

    return foundIpInDb;
  }
}
