import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = HydratedDocument<DeviceDb>;

@Schema()
export class DeviceDb {
  @Prop()
  iat: number;

  @Prop()
  exp: number;

  @Prop()
  deviceId: string;

  @Prop()
  deviceTitle: string;

  @Prop()
  ip: string;
  @Prop()
  userId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(DeviceDb);
