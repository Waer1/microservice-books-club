import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { catchError, throwError } from 'rxjs';

@Controller('books')
export class BooksController {
  constructor(@Inject('BOOKS_SERVICE') private bookClient: ClientProxy) {}

  @Get('find')
  async getBookById(@Query() getBookByIdDto: GetBookByIdDto) {
    return this.bookClient.send({ cmd: 'getBookById' }, getBookByIdDto).pipe(
      catchError((err) => {
        console.log('err', err);
        return throwError(err);
      }),
    );
  }

  @Get()
  async getAllBooks() {
    return this.bookClient.send({ cmd: 'getAllBooks' }, {});
  }

  @Post()
  async createBook(@Body() createBookDto: CreateBookDto) {
    console.log('createBookDto', createBookDto);
    return this.bookClient.send({ cmd: 'createBook' }, createBookDto);
  }
}
