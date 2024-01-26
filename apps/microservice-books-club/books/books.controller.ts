import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { AuthGuard } from '@app/shared/guards/auth.guard';
import { UserRequest } from '@app/shared/interfaces/user-request.interface';
import { UpdateBookDto } from '@app/shared/dtos/updateBook.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';

@Controller('books')
export class BooksController {
  constructor(@Inject('BOOKS_SERVICE') private bookClient: ClientProxy) {}

  @Get('find')
  // @UseInterceptors(ErrorInterceptor)
  async getBookById(@Query() getBookByIdDto: GetBookByIdDto) {
    return this.bookClient
      .send({ cmd: 'getBookById' }, getBookByIdDto)
      .pipe(catchError((val) => of({ error: val.message })));
  }

  @Get()
  async getAllBooks() {
    return this.bookClient.send({ cmd: 'getAllBooks' }, {});
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async createBook(
    @Req() req: UserRequest,
    @Body() createBookDto: CreateBookDto,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    createBookDto.author = req.user.id;
    return this.bookClient.send({ cmd: 'createBook' }, createBookDto);
  }

  @Get('author')
  async getBooksByAuthor(@Query('id') id: number) {
    return this.bookClient.send({ cmd: 'getBooksByAuthor' }, id);
  }

  @Get('myBooks')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async getMyBooks(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.bookClient.send({ cmd: 'getBooksByAuthor' }, req.user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async updateBook(
    @Req() req: UserRequest,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    if (!req?.user) {
      throw new UnauthorizedException();
    }
    updateBookDto.ownerId = req.user.id;
    return this.bookClient.send({ cmd: 'updateBook' }, updateBookDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async deleteBook(@Req() req: UserRequest, @Body() deleteBookDto: any) {
    if (!req?.user) {
      throw new UnauthorizedException();
    }
    deleteBookDto.ownerId = req.user.id;
    return this.bookClient.send({ cmd: 'deleteBook' }, deleteBookDto);
  }

  @Post('read')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async getReadBooks(
    @Req() req: UserRequest,
    @Body() ReadBookDto: ReadBookDto,
  ) {
    if (!req?.user) {
      throw new UnauthorizedException();
    }
    ReadBookDto.userId = req.user.id;
    return this.bookClient.send({ cmd: 'readBook' }, ReadBookDto);
  }

  @Get('Readinglist')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async getReadingList(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new UnauthorizedException();
    }
    return this.bookClient.send({ cmd: 'get-my-readlist' }, req.user.id);
  }
}
