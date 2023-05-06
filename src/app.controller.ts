import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { CatsRepository } from './cats,users,from lesson/cats.repository';
import { Types } from 'mongoose';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly catsRepository: CatsRepository,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cats,users,from lesson')
  getAllCats() {
    return this.catsRepository.findAll();
  }

  @Post('cats,users,from lesson')
  createCat(@Body() dto) {
    return this.catsRepository.create(dto);
  }

  @Put('cats,users,from lesson/:id')
  async updateCat(@Param('id') id: any) {
    const cats = await this.catsRepository.findAll();
    const targetCat = cats.find((cat) =>
      cat._id.equals(new Types.ObjectId(id)),
    )!;

    targetCat.setAge(18);

    return this.catsRepository.save(targetCat);
  }
}
