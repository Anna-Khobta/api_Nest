import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { IpLimitRepository } from './ip.limit.repository';
import { CustomException } from '../../functions/custom-exception';

@Injectable()
export class IpLimitGuard implements CanActivate {
  constructor(private ipLimitRepository: IpLimitRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const receivedIp = {
      ip: request.ip,
      iat: new Date(),
      endpoint: request.originalUrl,
    };

    await this.ipLimitRepository.saveIpInDb(receivedIp);

    const foundMatchesIp = await this.ipLimitRepository.findLast10sIp(
      receivedIp,
    );

    if (foundMatchesIp.length > 5) {
      throw new CustomException(
        'Too mane requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
