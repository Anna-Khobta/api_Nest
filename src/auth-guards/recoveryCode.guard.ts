import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersQueryRepository } from '../users/users.query.repository';

@Injectable()
export class RecoveryCodeGuard implements CanActivate {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recoveryCode = request.body.recoveryCode;

    const user = await this.usersQueryRepository.findUserByRecoveryCode(
      recoveryCode,
    );

    if (!user || user.passwordRecovery.exp < new Date()) {
      return false;
    }
    return true;
  }
}
