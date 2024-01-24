import { Test, TestingModule } from '@nestjs/testing';
import { BooksServiceController } from './books-service.controller';
import { BooksServiceService } from './books-service.service';

describe('BooksServiceController', () => {
  let booksServiceController: BooksServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BooksServiceController],
      providers: [BooksServiceService],
    }).compile();

    booksServiceController = app.get<BooksServiceController>(BooksServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(booksServiceController.getHello()).toBe('Hello World!');
    });
  });
});
