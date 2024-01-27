import { Module } from '@nestjs/common';
import { BooksServiceController } from './books-service.controller';
import { BooksServiceService } from './books-service.service';
import { Book, SharedModule, User } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Book, User]),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [BooksServiceController],
  providers: [BooksServiceService],
})
export class BooksServiceModule {}
