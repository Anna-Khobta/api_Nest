import { UsersRepository } from '../../users-repositories/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../input-models/ban-user-input-model.dto';
import { DeviceRepository } from '../../../devices/device.repository';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export class BanUserCommand {
  constructor(public userId: string, public inputModel: BanUserInputModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected deviceRepository: DeviceRepository,
  ) {}

  async execute(command: BanUserCommand): Promise<boolean | string> {
    // TODO надо ли тут ссылать на репозитории ИЛИ надо сюда перенести всю логику из них?

    const updateUserInfo = await this.usersRepository.updateBanInfo(
      command.userId,
      command.inputModel.isBanned,
      command.inputModel.banReason,
    );
    if (!updateUserInfo) {
      return false;
    }

    const updateDeviceInfo =
      await this.deviceRepository.deleteAllTokensByUserId(command.userId);

    return updateDeviceInfo;
  }
}
