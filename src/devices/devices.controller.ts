import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { JwtRefreshGuard } from '../auth-guards/jwt-refresh.guard';
import { DeviceRepository } from './device.repository';
import { CustomException } from '../functions/custom-exception';
import { DeviceService } from './device.service';
import { JwtPayloadClass } from '../auth/auth-input-classes';
import { JwtPayload } from '../decorators/JwtPayload.param.decorator';

@Controller('security')
export class DevicesController {
  constructor(
    protected deviceService: DeviceService,
    protected deviceRepository: DeviceRepository,
  ) {}
  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  async getAllDevicesForUser(@CurrentUserId() currentUserId: string) {
    const foundDevices = await this.deviceRepository.findAllDevices(
      currentUserId,
    );
    if (!foundDevices) {
      throw new CustomException('Devices not found', HttpStatus.NOT_FOUND);
    }
    return foundDevices;
  }

  @Delete('devices/:deviceId')
  @HttpCode(204)
  @UseGuards(JwtRefreshGuard)
  async deleteDeviceById(
    @Param('deviceId') deviceId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const isDeleted = await this.deviceService.deleteDevice(
      deviceId,
      currentUserId,
    );

    if (isDeleted === 'NotFound') {
      throw new CustomException('No such comment in Db', HttpStatus.NOT_FOUND);
    }

    if (isDeleted === 'NotOwn') {
      throw new CustomException('Not your comment', HttpStatus.FORBIDDEN);
    }

    if (!isDeleted) {
      throw new CustomException('Something wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
  @Delete('devices')
  @HttpCode(204)
  @UseGuards(JwtRefreshGuard)
  async deleteAllDeviceSessions(
    @JwtPayload() jwtPayload: JwtPayloadClass,
    @CurrentUserId() currentUserId: string,
  ) {
    const isTerminateAllSessionsExcludeCurrent =
      await this.deviceService.deleteAllExcludeOne(
        jwtPayload.deviceId,
        currentUserId,
      );
    if (!isTerminateAllSessionsExcludeCurrent) {
      throw new CustomException('Something wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
}
