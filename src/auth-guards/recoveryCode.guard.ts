import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersRepository } from '../users/users-repositories/users.repository';

@Injectable()
export class RecoveryCodeGuard implements CanActivate {
  constructor(private usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recoveryCode = request.body.recoveryCode;

    const user = await this.usersRepository.findUserByRecoveryCode(
      recoveryCode,
    );

    if (!user || user.passwordRecovery.exp < new Date()) {
      return false;
    }
    return true;
  }
}
