import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { SharedModule } from '@app/shared';

@Module({
  // assign the RabbitMQ queues (Books - auth) to the BooksController
  imports: [
    SharedModule.registerRmq('BOOKS_SERVICE', process.env.RABBITMQ_BOOKS_QUEUE),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [BooksController],
  providers: [],
})
export class BooksModule {}
