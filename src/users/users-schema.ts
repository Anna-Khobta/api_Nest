import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
export class User {
  @Prop({
    required: true,
  })
  accountData: AccountDataSchema;

  @Prop({
    required: true,
  })
  emailConfirmation: EmailConfirmationClass;

  @Prop({
    required: true,
  })
  passwordRecovery: PasswordRecoveryClass;

  @Prop()
  likesCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
