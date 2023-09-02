import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CustomException } from '../functions/custom-exception';
import { UsersQueryRepository } from '../users/users-repositories/users.query.repository';
import { UsersRepository } from '../users/users-repositories/users.repository';

@Injectable()
export class LoginPasswordGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const foundUserInDb =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        request.body.loginOrEmail,
        request.body.loginOrEmail,
      );

    if (!foundUserInDb) {
      throw new CustomException('No such user in app', HttpStatus.UNAUTHORIZED);
    }

    const isUserAlreadyBanned = await this.usersRepository.isCurrentUserBanned(
      foundUserInDb._id.toString(),
    );

    if (isUserAlreadyBanned) {
      throw new CustomException('User was banned', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordCorrect = await this.usersService.checkPasswordCorrect(
      foundUserInDb.accountData.hashPassword,
      request.body.password,
    );

    if (!isPasswordCorrect) {
      throw new CustomException(
        'Incorrect login or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    request.user = foundUserInDb._id.toString();
    return true;
  }
}
