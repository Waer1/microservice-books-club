import { Book } from '@app/shared';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BooksServiceService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findBookById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
    });
    if (!book) {
      throw new BadRequestException(`Book with id ${id} not found`);
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
    const newBook = this.bookRepository.create(book);
    return await this.bookRepository.save(newBook);
  }
}
