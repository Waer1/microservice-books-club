import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { SharedModule } from '@app/shared';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';

@Module({
  imports: [
    SharedModule.registerRmq('BOOKS_SERVICE', process.env.RABBITMQ_BOOKS_QUEUE),
  ],
  controllers: [BooksController],
  providers: [
    {
      provide: 'APP_INTERTCEPTOR',
      useClass: ErrorInterceptor,
    },
  ],
})
export class BooksModule {}
