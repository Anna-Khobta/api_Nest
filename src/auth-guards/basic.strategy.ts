import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { basicConstants } from './constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, login, password): Promise<boolean> => {
    if (
      basicConstants.login === login &&
      basicConstants.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
