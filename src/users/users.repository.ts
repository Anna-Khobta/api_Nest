import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  findUsers(term: string) {
    return [
      { id: 1, name: 'Anna' },
      { id: 2, name: 'Miu' },
    ].filter((u) => !term || u.name.indexOf(term) > -1);
  }
}
