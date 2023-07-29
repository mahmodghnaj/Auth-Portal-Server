import { Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Get()
  findAll(@Res({ passthrough: true }) response: any) {
    response.setCookie('key', 'value');
    return 'hello';
  }
  @Post()
  test(): string {
    return 'test';
  }
}
