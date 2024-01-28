import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { catchError, of } from 'rxjs';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { AuthGuard } from '@app/shared/guards/auth.guard';
import { UserRequest } from '@app/shared/interfaces/user-request.interface';
import { UpdateBookDto } from '@app/shared/dtos/updateBook.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';

@Controller('books')
export class BooksController {
  constructor(@Inject('BOOKS_SERVICE') private bookClient: ClientProxy) {}

  /**
   * This method retrieves a book by its ID.
   *
   * @param getBookByIdDto - An object that holds the ID of the book to retrieve. It is an instance of the GetBookByIdDto class.
   *
   * The getBookById method does the following:
   * - Uses the bookClient to send a 'getBookById' command with the GetBookByIdDto as payload to the microservice.
   *
   * @returns An Observable that can retrieves a book by its ID.
   */
  @Get('find')
  async getBookById(@Query() getBookByIdDto: GetBookByIdDto) {
    return this.bookClient.send({ cmd: 'getBookById' }, getBookByIdDto);
  }

  /**
   * This method retrieves all books.
   *
   * The getAllBooks method does the following:
   * - Uses the bookClient to send a 'getAllBooks' command with an empty object as payload to the book microservice.
   *
   * @returns An Observable that can retrieves a book by its ID.
   */
  @Get()
  async getAllBooks() {
    return this.bookClient.send({ cmd: 'getAllBooks' }, {});
  }

  /**
   * This method handles the creation of a new book.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   * @param createBookDto - An object that holds the data for the new book. It is an instance of the CreateBookDto class.
   *
   * The createBook method does the following:
   * - Checks if the request's user object is defined. If not, it throws a BadRequestException.
   * - Sets the author of the new book to the ID of the user making the request.
   * - Uses the bookClient to send a 'createBook' command with the CreateBookDto as payload to the microservice.
   *
   * @returns An Observable that contain the created book.
   */
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

  /**
   * This method retrieves all books by a specific author.
   *
   * @param id - The ID of the author whose books to retrieve.
   *
   * The getBooksByAuthor method does the following:
   * - Uses the bookClient to send a 'getBooksByAuthor' command with the author's ID as payload to the microservice.
   *
   * @returns An Observable of the books written by the specified author.
   */
  @Get('author')
  async getBooksByAuthor(@Query('id') id: number) {
    return this.bookClient.send({ cmd: 'getBooksByAuthor' }, id);
  }

  /**
   * This method retrieves all books by the logged-in user.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   *
   * The getMyBooks method does the following:
   * - Checks if the request's user object is defined. If not, it throws a BadRequestException.
   * - Uses the bookClient to send a 'getBooksByAuthor' command with the user's ID as payload to the microservice.
   *
   * @returns An Observable of the books written by the logged-in user.
   */
  @Get('myBooks')
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  async getMyBooks(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.bookClient.send({ cmd: 'getBooksByAuthor' }, req.user.id);
  }

  /**
   * This method updates a book.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   * @param updateBookDto - An object that holds the data for the book to update. It is an instance of the UpdateBookDto class.
   *
   * The updateBook method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Sets the owner of the book to the ID of the user making the request.
   * - Uses the bookClient to send an 'updateBook' command with the UpdateBookDto as payload to the microservice.
   *
   * @returns An Observable of the updated book.
   */
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

  /**
   * This method deletes a book.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   * @param deleteBookDto - An object that holds the data for the book to delete.
   *
   * The deleteBook method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Sets the owner of this request to the ID of the user making the request.
   * - Uses the bookClient to send a 'deleteBook' command with the DeleteBookDto as payload to the microservice.
   *
   * @returns An Observable of the deleted book.
   */
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

  /**
   * This method marks a book as read( add it to reading list ).
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   * @param readBookDto - An object that holds the data for the book to mark as read.
   *
   * The readBook method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Uses the bookClient to send a 'readBook' command with the ReadBookDto as payload to the microservice.
   *
   * @returns An Observable of the book marked as read.
   */
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

  /**
   * This method retrieves the reading list of the logged-in user.
   *
   * @param req - An object that represents the request. It is an instance of the UserRequest interface.
   *
   * The getReadingList method does the following:
   * - Checks if the request's user object is defined. If not, it throws an UnauthorizedException.
   * - Uses the bookClient to send a 'get-my-readlist' command with the user's ID as payload to the microservice.
   *
   * @returns An Observable of the reading list of the logged-in user.
   */
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
