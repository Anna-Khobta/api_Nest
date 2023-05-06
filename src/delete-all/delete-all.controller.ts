import { Controller, Delete } from '@nestjs/common';

import { DeleteAllService } from './delete-all.service';

@Controller('testing/all-data')
export class DeleteAllController {
  constructor(protected deleteAllService: DeleteAllService) {}
  @Delete()
  async deleteAll() {
    return await this.deleteAllService.deleteAll();
  }
}
