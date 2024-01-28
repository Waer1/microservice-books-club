import { Book } from '@app/shared';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { DeleteBookDto } from '@app/shared/dtos/DeleteBook.dto';
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
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Repository } from 'typeorm';

/**
 * This service provides methods to interact with the books repository and the auth service in case of book user relations.
 */

@Injectable()
export class BooksServiceService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  /**
   * This method retrieves a book by its ID.
   *
   * @param id - The ID of the book to retrieve.
   *
   * @throws RpcException - If the book with the specified ID is not found.
   *
   * @returns The book with the specified ID.
   */
  async findBookById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!book) {
      throw new RpcException(
        new NotFoundException(`Book with id ${id} not found`),
      );
    }
    return book;
  }

  /**
   * This method retrieves all books.
   *
   * @returns An array of all books.
   */
  async getAllBooks(): Promise<Book[]> {
    return await this.bookRepository.find({});
  }

  /**
   * This method retrieves a book by its ID.
   *
   * @param id - The ID of the book to retrieve.
   *
   * @returns The book with the specified ID.
   */
  async getBookById(id: number): Promise<Book> {
    return await this.findBookById(id);
  }

  /**
   * This method creates a new book.
   *
   * @param book - An object that holds the data for the new book. It is an instance of the CreateBookDto class.
   *
   * @returns The newly created book.
   */
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

  /**
   * This method updates a book.
   *
   * @param data - An object that holds the data for the book to update. It is an instance of the UpdateBookDto class.
   *
   * The updateBook method does the following:
   * - Retrieves the book to update from the bookRepository.
   * - Checks if the user is the author of the book. If not, it throws an UnauthorizedException.
   * - Assigns the updates to the existing book.
   * - Saves the updated book to the bookRepository.
   *
   * @returns The updated book.
   */
  async updateBook(data: UpdateBookDto): Promise<Book> {
    const { BookId, updates, ownerId } = data;

    // Check if the user is the author of the book
    const existingBook = await this.getBookById(BookId);

    if (existingBook.author.id !== ownerId) {
      throw new RpcException(
        new UnauthorizedException('You are not the author of this book'),
      );
    }

    Object.assign(existingBook, updates);

    return await this.bookRepository.save(existingBook);
  }

  /**
   * This method deletes a book.
   *
   * @param data - An object that holds the data for the book to delete. It is an instance of the DeleteBookDto class.
   *
   * The deleteBook method does the following:
   * - Retrieves the book to delete from the bookRepository.
   * - Checks if the user is the author of the book. If not, it throws an UnauthorizedException.
   * - Deletes the book from the bookRepository.
   *
   * @returns An object with a message indicating that the book has been deleted.
   */
  async deleteBook(data: DeleteBookDto): Promise<{ message: string }> {
    const { ownerId, BookId } = data;

    // Check if the user is the author of the book
    const existingBook = await this.getBookById(BookId);
    if (existingBook.author.id !== ownerId) {
      throw new RpcException(
        new UnauthorizedException('You are not the author of this book'),
      );
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

  /**
   * This method marks a book as read for the user.
   *
   * @param data - An object that holds the data for the book to mark as read. It is an instance of the ReadBookDto class.
   *
   * The readBook method does the following:
   * - Retrieves the book to mark as read using the getBookById method.
   * - Checks if the user is the author of the book. If so, it throws a BadRequestException.
   * - Deletes the author from the existingBook object.
   * - Sends a 'read-book' command to the authServiceClient with the book's ID and the user's ID as payload.
   *
   * @returns An object with a message indicating that the book has been marked as read.
   */
  async readBook(data: ReadBookDto) {
    const { bookId, userId } = data;

    // Check if the user is the author of the book
    const existingBook = await this.getBookById(bookId);

    if (existingBook.author.id === userId) {
      throw new RpcException(
        new BadRequestException('You cannot read your own book'),
      );
    }

    delete existingBook.author;

    const redinglist = this.authServiceClient
      .send(
        { cmd: 'add-to-my-readlist' },
        { userId: userId, book: existingBook },
      )
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );

    return redinglist;
  }

  /**
   * This method retrieves the reading list of a user.
   *
   * @param userId - The ID of the user whose reading list to retrieve.
   *
   * The getMyReadlist method does the following:
   * - Sends a 'get-my-readlist' command to the authServiceClient with the user's ID as payload.
   *
   * @returns An Observable of the reading list of the specified user.
   */
  async getMyReadlist(userId: number) {
    const readlist = this.authServiceClient.send(
      { cmd: 'get-my-readlist' },
      userId,
    );

    return readlist;
  }
}
