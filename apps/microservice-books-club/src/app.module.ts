import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';

@Module({
  imports: [BooksModule],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERTCEPTOR',
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}

