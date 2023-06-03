import { Inject, Injectable } from '@nestjs/common';
import { DeleteAllRepository } from './delete-all.repository';

@Injectable()
export class DeleteAllService {
  constructor(
    @Inject(DeleteAllRepository)
    protected deleteAllRepository: DeleteAllRepository,
  ) {}

  async deleteAll() {
    try {
      await this.deleteAllRepository.deleteAllBlogs();
      await this.deleteAllRepository.deleteAllPosts();
      await this.deleteAllRepository.deleteAllUsers();
      await this.deleteAllRepository.deleteAllComments();
      await this.deleteAllRepository.deleteAllDevices();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
