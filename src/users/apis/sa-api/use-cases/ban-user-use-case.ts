import { UsersRepository } from '../../../users-repositories/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../../input-models/ban-user-input-model.dto';
import { DeviceRepository } from '../../../../devices/device.repository';

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
    const updateUserInfo = await this.usersRepository.updateBanInfo(
      command.userId,
      command.inputModel.isBanned,
      command.inputModel.banReason,
    );
    if (!updateUserInfo) {
      return false;
    }

    return await this.deviceRepository.deleteAllTokensByUserId(command.userId);
  }
}
