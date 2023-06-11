import { Length } from 'class-validator';

export class BanUserInputModel {
  isBanned: boolean;
  @Length(20)
  banReason: string;
}
