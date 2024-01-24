import { Controller, Get } from '@nestjs/common';
import { BooksServiceService } from './books-service.service';

@Controller()
export class BooksServiceController {
  constructor(private readonly booksServiceService: BooksServiceService) {}

  @Get()
  getHello(): string {
    return this.booksServiceService.getHello();
  }
}
