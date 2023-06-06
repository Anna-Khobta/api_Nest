import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { CustomException } from '../functions/custom-exception';

@Injectable()
export class IfRefreshTokenInDbGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies['refreshToken'];

    const decodedRT = await this.jwtService.decode(refreshToken);

    console.log(decodedRT, ' decodedRT ');

    const checkJwtInDb = await this.authService.ifTokenInfoInDb(decodedRT);

    if (!checkJwtInDb) {
      throw new CustomException('Blog not found', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
