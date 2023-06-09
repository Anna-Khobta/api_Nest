import { Length } from 'class-validator';

export class BanUserInputModel {
  isBanned: boolean;
  @Length(1, 20)
  banReason: string;
}
