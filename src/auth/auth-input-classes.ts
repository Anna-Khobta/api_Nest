export class JwtPayloadClass {
  iat: number;
  exp: number;
  deviceId: string;
  userId: string;
}

export class CreateNewPassInputModel {
  newPassword: string;
  recoveryCode: string;
}
