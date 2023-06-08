import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/sa-api/users.service';

@Injectable()
export class IfHaveUserJwtAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const auth = request.headers.authorization;
    if (auth) {
      if ('Bearer' === request.headers.authorization.split(' ')[0]) {
        const tokenFromHead = auth.split(' ')[1];
        let userId;
        try {
          const result: any = this.jwtService.verify(tokenFromHead);
          // если verify не сработает, упадет ошибка
          userId = result.userId;
        } catch (error) {
          return false;
        }
        if (userId) {
          const user = await this.usersService.findUserById(userId.toString());
          request.user = user.id;
        }
      }
    }
    return true;
  }
}
