import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users-schema';
import { UsersRepository } from './users-repositories/users.repository';
import {
  UserTypeWiithoutIds,
  UserViewType,
  UserWithMongoId,
} from '../blogs/types';
import { UsersQueryRepository } from './users-repositories/users.query.repository';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserInputModelClass } from './users-input-model-class.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
  ) {}

  async createUser(
    inputModel: CreateUserInputModelClass,
    isConfirmed: boolean,
  ): Promise<string | null> {
    const checkIsLoginOrEmailAlreadyUsed =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        inputModel.login,
        inputModel.email,
      );

    if (checkIsLoginOrEmailAlreadyUsed) {
      if (
        checkIsLoginOrEmailAlreadyUsed.accountData.login === inputModel.login
      ) {
        return 'login';
      }
      if (
        checkIsLoginOrEmailAlreadyUsed.accountData.email === inputModel.email
      ) {
        return 'email';
      }
    }

    const salt = await bcrypt.genSalt(5);

    const hashPassword = await bcrypt.hash(inputModel.password, salt);

    const newUser: UserTypeWiithoutIds = {
      accountData: {
        login: inputModel.login,
        email: inputModel.email,
        hashPassword: hashPassword,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isConfirmed: isConfirmed,
      },
      passwordRecovery: {
        recoveryCode: null,
        exp: null,
      },
    };

    const userInstance = new this.userModel(newUser);
    const saveUser = await this.usersRepository.save(userInstance);

    if (!saveUser) {
      return null;
    }
    return userInstance._id.toString();
  }

  async checkPasswordCorrect(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(id);
  }

  async deleteAllUsers(): Promise<number> {
    return this.usersRepository.deleteAllUsers();
  }

  async findUserById(userId: string): Promise<UserViewType | null> {
    return await this.usersQueryRepository.findUserById(userId);
  }

  async checkUserExist(
    login: string | null,
    email: string | null,
  ): Promise<UserWithMongoId | null | string> {
    const foundUser = await this.usersQueryRepository.findUserByLoginOrEmail(
      login,
      email,
    );

    if (foundUser) {
      if (foundUser.accountData.login === login) {
        return 'Login';
      }

      if (foundUser.accountData.email === email) {
        return 'Email';
      }

      return foundUser;
    }

    try {
      const foundUser = await this.userModel
        .findOne({
          $or: [{ 'accountData.login': login }, { 'accountData.email': email }],
        })
        .lean();

      return foundUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
