import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users-schema';
import { UsersRepository } from './users.repository';
import { UserTypeWiithoutIds, UserViewType } from '../blogs/types';
import { UsersQueryRepository } from './users.query.repository';
import { CreateUserInputModelType } from './users.controller';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(5);
@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
  ) {}

  async createUser(
    inputModel: CreateUserInputModelType,
    isConfirmed: boolean,
  ): Promise<string | null> {
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
        expirationDate: new Date(),
        isConfirmed: isConfirmed,
      },
      passwordRecovery: {
        recoveryCode: null,
        exp: null,
      },
    };

    const userInstance = new this.userModel(newUser);
    await this.usersRepository.save(userInstance);

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
}
