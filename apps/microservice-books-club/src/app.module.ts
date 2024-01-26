import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BooksModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERTCEPTOR',
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}

