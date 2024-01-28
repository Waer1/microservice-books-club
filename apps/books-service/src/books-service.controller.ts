import { Controller, Get } from '@nestjs/common';
import { BooksServiceService } from './books-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetBookByIdDto } from '../../../libs/shared/src/dtos/GetBookById.dto';
import { CreateBookDto } from '../../../libs/shared/src/dtos/CreateBook.dto';
import { UpdateBookDto } from '@app/shared/dtos/updateBook.dto';
import { DeleteBookDto } from '@app/shared/dtos/DeleteBook.dto';
import { ReadBookDto } from '@app/shared/dtos/readBook.dto';

@Controller()
export class BooksServiceController {
  constructor(private readonly booksServiceService: BooksServiceService) {}

  /**
   * This pattern retrieves all books.
   *
   * The getAllBooks pattern does the following:
   * - Calls the getAllBooks method from the booksServiceService.
   *
   * @returns An Observable of all books.
   */
  @MessagePattern({ cmd: 'getAllBooks' })
  async getAllBooks() {
    return this.booksServiceService.getAllBooks();
  }

  /**
   * This pattern retrieves a book by its ID.
   *
   * @param data - An object that holds the ID of the book to retrieve. It is an instance of the GetBookByIdDto class.
   *
   * The getBookById pattern does the following:
   * - Calls the getBookById method from the booksServiceService with the book's ID as argument.
   *
   * @returns An Observable of the book with the specified ID.
   */
  @MessagePattern({ cmd: 'getBookById' })
  async getBookById(@Payload() data: GetBookByIdDto) {
    return this.booksServiceService.getBookById(data.id);
  }

  /**
   * This pattern creates a new book.
   *
   * @param book - An object that holds the data for the new book. It is an instance of the CreateBookDto class.
   *
   * The createBook pattern does the following:
   * - Calls the createBook method from the booksServiceService with the CreateBookDto as argument.
   *
   * @returns An Observable of the newly created book.
   */
  @MessagePattern({ cmd: 'createBook' })
  async createBook(@Payload() book: CreateBookDto) {
    return this.booksServiceService.createBook(book);
  }

  /**
   * This pattern updates a book.
   *
   * @param data - An object that holds the data for the book to update. It is an instance of the UpdateBookDto class.
   *
   * The updateBook pattern does the following:
   * - Calls the updateBook method from the booksServiceService with the UpdateBookDto as argument.
   *
   * @returns An Observable of the updated book.
   */
  @MessagePattern({ cmd: 'updateBook' })
  async updateBook(@Payload() data: UpdateBookDto) {
    return this.booksServiceService.updateBook(data);
  }

  /**
   * This pattern deletes a book.
   *
   * @param data - An object that holds the data for the book to delete. It is an instance of the DeleteBookDto class.
   *
   * The deleteBook pattern does the following:
   * - Calls the deleteBook method from the booksServiceService with the DeleteBookDto as argument.
   *
   * @returns An Observable of the deleted book.
   */
  @MessagePattern({ cmd: 'deleteBook' })
  async deleteBook(@Payload() data: DeleteBookDto) {
    return this.booksServiceService.deleteBook(data);
  }

  /**
   * This pattern retrieves all books by a specific author.
   *
   * @param AuthorId - The ID of the author whose books to retrieve.
   *
   * The getBooksByAuthor pattern does the following:
   * - Calls the getBooksByAuthor method from the booksServiceService with the author's ID as argument.
   *
   * @returns An Observable of the books written by the specified author.
   */
  @MessagePattern({ cmd: 'getBooksByAuthor' })
  async getBooksByAuthor(@Payload() AuthorId: number) {
    return this.booksServiceService.getBooksByAuthor(AuthorId);
  }

  /**
   * This pattern marks a book as read.
   *
   * @param readBookDto - An object that holds the data for the book to mark as read. It is an instance of the ReadBookDto class.
   *
   * The readBook pattern does the following:
   * - Calls the readBook method from the booksServiceService with the ReadBookDto as argument.
   *
   * @returns An Observable of the book marked as read.
   */
  @MessagePattern({ cmd: 'readBook' })
  async readBook(@Payload() readBookDto: ReadBookDto) {
    return this.booksServiceService.readBook(readBookDto);
  }

  /**
   * This pattern retrieves the reading list of a user.
   *
   * @param userId - The ID of the user whose reading list to retrieve.
   *
   * The getMyReadlist pattern does the following:
   * - Calls the getMyReadlist method from the booksServiceService with the user's ID as argument.
   *
   * @returns An Observable of the reading list of the specified user.
   */
  @MessagePattern({ cmd: 'get-my-readlist' })
  async getMyReadlist(@Payload() userId: number) {
    return this.booksServiceService.getMyReadlist(userId);
  }
}
