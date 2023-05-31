declare global {
  declare namespace Express {
    export interface Request {
      jwtPayload: {
        userId: string;
        deviceId: string;
        iat: number;
        exp: number;
      } | null;
    }
  }
}
