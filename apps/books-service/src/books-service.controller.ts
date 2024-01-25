import { Controller, Get } from '@nestjs/common';
import { BooksServiceService } from './books-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { Book } from '@app/shared';
import { GetBookByIdDto } from '../../../libs/shared/src/dtos/GetBookById.dto';
import { CreateBookDto } from '../../../libs/shared/src/dtos/CreateBook.dto';

@Controller()
export class BooksServiceController {
  constructor(private readonly booksServiceService: BooksServiceService) {}

  @MessagePattern({ cmd: 'getAllBooks' })
  getAllBooks() {
    return this.booksServiceService.getAllBooks();
  }

  @MessagePattern({ cmd: 'getBookById' })
  getBookById(data: GetBookByIdDto) {
    return this.booksServiceService.getBookById(data.id);
  }

  @MessagePattern({ cmd: 'createBook' })
  createBook(book: CreateBookDto) {
    return this.booksServiceService.createBook(book);
  }
}
