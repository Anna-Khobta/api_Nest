import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users-schema';
import * as bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(5);

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async save(userInstance: UserDocument): Promise<boolean> {
    try {
      await userInstance.save();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) return false;

    await userInstance.deleteOne();
    return true;
  }

  async deleteAllUsers(): Promise<number> {
    const result = await this.userModel.deleteMany({});
    return result.deletedCount;
  }

  async updateConfirmation(userId: string): Promise<string | null> {
    const userInstance = await this.userModel.findOne({ _id: userId });

    if (!userInstance) {
      return null;
    }

    userInstance.emailConfirmation.isConfirmed = true;

    try {
      await userInstance.save();
      return userInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateConfirmationCode(
    id: string,
    generateConfirmationCode: string,
    generateExpirationDate: Date,
  ): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ _id: id });

    if (!userInstance) {
      return false;
    }

    userInstance.emailConfirmation.confirmationCode = generateConfirmationCode;
    userInstance.emailConfirmation.expirationDate = generateExpirationDate;

    await userInstance.save();
    return true;
  }

  async updatePasswordRecoveryCode(
    id: string,
    generatePassRecovCode: string,
    generatePassRecovCodeExpirationDate: Date,
  ): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) {
      return false;
    }

    userInstance.passwordRecovery.recoveryCode = generatePassRecovCode;
    userInstance.passwordRecovery.exp = generatePassRecovCodeExpirationDate;

    await userInstance.save();

    return true;
  }

  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<string | null> {
    const hashPassword = await bcrypt.hash(newPassword, salt);

    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) {
      return null;
    }
    userInstance.accountData.hashPassword = hashPassword;
    userInstance.passwordRecovery.recoveryCode = null;
    userInstance.passwordRecovery.exp = null;

    try {
      await userInstance.save();
      return userInstance._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateBanInfo(
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        return false;
      }

      if (user.banInfo.isBanned === isBanned) {
        return true;
      }
      user.banInfo.isBanned = isBanned;
      user.banInfo.banReason = banReason;
      user.banInfo.banDate = new Date();

      // после обновления true на false - надо делать null banReason и  banDate?
      // если да, то добавить if else или switch case

      await user.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
