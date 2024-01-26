import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { catchError, of } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { AuthGuard } from '@app/shared/guards/auth.guard';
import { UserRequest } from '@app/shared/interfaces/user-request.interface';
// import { UserRequest } from '@app/shared/interfaces/user-request.interface';
// import { AuthGuard } from '@nestjs/passport';
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
    console.log('createBookDto', createBookDto)
    return this.bookClient.send({ cmd: 'createBook' }, createBookDto);
  }

}
