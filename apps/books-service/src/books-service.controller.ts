import { Controller, Get } from '@nestjs/common';
import { BooksServiceService } from './books-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Book } from '@app/shared';
import { GetBookByIdDto } from '../../../libs/shared/src/dtos/GetBookById.dto';
import { CreateBookDto } from '../../../libs/shared/src/dtos/CreateBook.dto';
import { UpdateBookDto } from '@app/shared/dtos/updateBook.dto';
import { DeleteBookDto } from '@app/shared/dtos/DeleteBook.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';

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

  @MessagePattern({ cmd: 'updateBook' })
  async updateBook(@Payload() data: UpdateBookDto) {
    return this.booksServiceService.updateBook(data);
  }

  @MessagePattern({ cmd: 'deleteBook' })
  async deleteBook(@Payload() data: DeleteBookDto) {
    return this.booksServiceService.deleteBook(data);
  }

  @MessagePattern({ cmd: 'getBooksByAuthor' })
  async getBooksByAuthor(@Payload() AuthorId: number) {
    return this.booksServiceService.getBooksByAuthor(AuthorId);
  }

  @MessagePattern({ cmd: 'readBook' })
  async readBook(@Payload() readBookDto: ReadBookDto) {
    return this.booksServiceService.readBook(readBookDto);
  }

  @MessagePattern({ cmd: 'get-my-readlist' })
  async getMyReadlist(@Payload() userId: number) {
    return this.booksServiceService.getMyReadlist(userId);
  }
}
