import { UsersRepository } from '../../users-repositories/users.repository';
import { UsersQueryRepository } from '../../users-repositories/users.query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users-schema';
import { Model } from 'mongoose';
import { CreateUserInputModel } from '../../users-input-model.dto';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewType } from '../../../blogs/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export class CreateUserCommand {
  constructor(
    public inputModel: CreateUserInputModel,
    public isConfirmed: boolean,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewType | string> {
    // check exist and return error
    const checkIsLoginOrEmailAlreadyUsed =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        command.inputModel.login,
        command.inputModel.email,
      );

    if (checkIsLoginOrEmailAlreadyUsed) {
      if (
        checkIsLoginOrEmailAlreadyUsed.accountData.login ===
        command.inputModel.login
      ) {
        return 'login';
      }
      if (
        checkIsLoginOrEmailAlreadyUsed.accountData.email ===
        command.inputModel.email
      ) {
        return 'email';
      }
    }

    // create new user
    const salt = await bcrypt.genSalt(5);

    const hashPassword = await bcrypt.hash(command.inputModel.password, salt);

    const newUser = {
      accountData: {
        login: command.inputModel.login,
        email: command.inputModel.email,
        hashPassword: hashPassword,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isConfirmed: command.isConfirmed,
      },
      passwordRecovery: {
        recoveryCode: null,
        exp: null,
      },
      banInfo: {
        isBanned: false,
        banDate: true,
        banReason: true,
      },
    };

    const userInstance = new this.userModel(newUser);
    const saveUser = await this.usersRepository.save(userInstance);

    if (!saveUser) {
      return null;
    }
    const createdUserId = userInstance._id.toString();

    // return user with View Model
    return await this.usersQueryRepository.findUserById(createdUserId);
  }
}
