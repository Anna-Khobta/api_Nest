import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users-schema';
import * as bcrypt from 'bcrypt';
import { is, tr } from 'date-fns/locale';

const salt = bcrypt.genSaltSync(5);

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserLogin(userId: string): Promise<string | null> {
    try {
      const foundUser = await this.userModel.findById(userId);

      console.log(foundUser, 'foundUser');
      return foundUser.accountData.login;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
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
      if (isBanned === false) {
        user.banInfo.isBanned = isBanned;
        user.banInfo.banReason = null;
        user.banInfo.banDate = null;
      } else {
        user.banInfo.isBanned = isBanned;
        user.banInfo.banReason = banReason;
        user.banInfo.banDate = new Date();
      }

      await user.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getAllBannedUsersIds(): Promise<string[] | null> {
    const allBannedUsers = await this.userModel.find({
      'banInfo.isBanned': true,
    });

    const bannedUserIds = allBannedUsers.map((user) => user._id.toString());
    return bannedUserIds;
  }

  async isCurrentUserBanned(userId: string): Promise<boolean> {
    try {
      const isBanned = await this.userModel
        .find({
          $and: [{ _id: userId }, { 'banInfo.isBanned': true }],
        })
        .lean();

      if (isBanned.length < 1) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
