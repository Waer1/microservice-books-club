import { Book } from '@app/shared';
import { CreateBookDto } from '@app/shared/dtos/CreateBook.dto';
import { GetBookByIdDto } from '@app/shared/dtos/GetBookById.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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
    )
    const user = await firstValueFrom(userObservable);

    const newBook = this.bookRepository.create({
      author: user,
      title: book.title,
      description: book.description,
    });
    return await this.bookRepository.save(newBook);
  }
}
