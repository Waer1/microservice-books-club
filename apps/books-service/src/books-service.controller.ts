import { Controller, Get } from '@nestjs/common';
import { BooksServiceService } from './books-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Book } from '@app/shared';
import { GetBookByIdDto } from '../../../libs/shared/src/dtos/GetBookById.dto';
import { CreateBookDto } from '../../../libs/shared/src/dtos/CreateBook.dto';

@Controller()
export class BooksServiceController {
  constructor(private readonly booksServiceService: BooksServiceService) {}

  @MessagePattern({ cmd: 'getAllBooks' })
  async getAllBooks() {
    return this.booksServiceService.getAllBooks();
  }

  @MessagePattern({ cmd: 'getBookById' })
  async getBookById(@Payload() data: GetBookByIdDto) {
    return this.booksServiceService.getBookById(data.id);
  }

  @MessagePattern({ cmd: 'createBook' })
  async createBook(@Payload() book: CreateBookDto) {
    return this.booksServiceService.createBook(book);
  }
}
