import { Controller, Delete, HttpCode } from '@nestjs/common';

import { DeleteAllService } from './delete-all.service';

@Controller('testing/all-data')
export class DeleteAllController {
  constructor(protected deleteAllService: DeleteAllService) {}
  @Delete()
  @HttpCode(204)
  async deleteAll() {
    return await this.deleteAllService.deleteAll();
  }
}
