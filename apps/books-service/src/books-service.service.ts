import { Book } from '@app/shared';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { DeleteBookDto } from '@app/shared/dtos/DeleteBook.dto';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';
import { UpdateBookDto } from '@app/shared/dtos/updateBook.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class BooksServiceService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  async findBookById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
    });
    if (!book) {
      throw new RpcException(
        new NotFoundException(`Book with id ${id} not found`),
      );
    }
    return book;
  }

  async getAllBooks(): Promise<Book[]> {
    return await this.bookRepository.find({});
  }

  async getBookById(id: number): Promise<Book> {
    return await this.findBookById(id);
  }

  async createBook(book: CreateBookDto): Promise<Book> {
    const userObservable = await this.authServiceClient.send(
      { cmd: 'get-user' },
      { id: book.author },
    );
    const user = await firstValueFrom(userObservable);

    const newBook = this.bookRepository.create({
      author: user,
      title: book.title,
      description: book.description,
    });
    return await this.bookRepository.save(newBook);
  }

  async updateBook(data: UpdateBookDto): Promise<Book> {
    const { BookId, updates, ownerId } = data;

    console.log('BookId', BookId);
    // Check if the user is the author of the book
    const existingBook = await this.getBookById(BookId);
    console.log('existingBook', existingBook);
    if (existingBook.author.id !== ownerId) {
      throw new UnauthorizedException('You are not the author of this book');
    }

    console.log('existingBook', existingBook);
    Object.assign(existingBook, updates);

    console.log('return ');
    return await this.bookRepository.save(existingBook);
  }

  async deleteBook(data: DeleteBookDto): Promise<{ message: string }> {
    const { ownerId, BookId } = data;

    // Check if the user is the author of the book
    const existingBook = await this.getBookById(BookId);
    if (existingBook.author.id !== ownerId) {
      throw new UnauthorizedException('You are not the author of this book');
    }

    await this.bookRepository.delete({ id: BookId });

    return {
      message: 'Book deleted successfully',
    };
  }

  async getBooksByAuthor(AuthorId: number): Promise<Book[]> {
    const books = await this.bookRepository.find({
      where: {
        author: {
          id: AuthorId,
        },
      },
    });
    if (!books) {
      throw new RpcException(
        new NotFoundException(`Books by author with id ${AuthorId} not found`),
      );
    }
    return books;
  }

  async readBook(data: ReadBookDto) {
    const { bookId , userId } = data;

    console.log('1')
    // Check if the user is the author of the book
    const existingBook = await this.getBookById(bookId);

    console.log('2', existingBook)
    const redinglist = this.authServiceClient.send(
      { cmd: 'add-to-my-readlist' },
      { userId: userId, book: existingBook },
    );

    console.log('3')
    return redinglist;
  }

  async getMyReadlist(userId: number) {
    const readlist = this.authServiceClient.send(
      { cmd: 'get-my-readlist' },
      userId,
    );

    return readlist;
  }
}
