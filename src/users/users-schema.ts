import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class AccountDataSchema {
  @Prop({
    required: true,
    unique: true,
  })
  login: string;
  @Prop({
    required: true,
    unique: true,
  })
  email: string;
  @Prop({
    required: true,
  })
  hashPassword: string;
  @Prop({
    required: true,
  })
  createdAt: string;
}

@Schema()
export class EmailConfirmationClass {
  @Prop({
    required: true,
  })
  confirmationCode: string;
  @Prop({
    required: true,
  })
  expirationDate: Date;
  @Prop({
    required: true,
  })
  isConfirmed: boolean;
}

@Schema()
export class PasswordRecoveryClass {
  @Prop()
  recoveryCode: string;
  @Prop()
  exp: Date;
}

@Schema()
export class UserBanInfoClass {
  @Prop({
    required: true,
  })
  isBanned: boolean;
  @Prop({ type: SchemaTypes.Mixed })
  banDate: Date | null;
  @Prop({ type: SchemaTypes.Mixed })
  banReason: string | null;
}

@Schema()
export class User {
  @Prop()
  accountData: AccountDataSchema;

  @Prop()
  emailConfirmation: EmailConfirmationClass;

  @Prop()
  passwordRecovery: PasswordRecoveryClass;

  @Prop()
  banInfo: UserBanInfoClass;
  @Prop()
  likesCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
