import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IpDbDocument = HydratedDocument<IpDb>;

@Schema()
export class IpDb {
  @Prop({
    required: true,
  })
  ip: string;

  @Prop({
    required: true,
  })
  iat: Date;

  @Prop({
    required: true,
  })
  endpoint: string;
}

export const IpDbSchema = SchemaFactory.createForClass(IpDb);
