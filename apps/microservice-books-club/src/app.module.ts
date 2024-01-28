import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';
import { AuthModule } from '../auth/auth.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggingInterceptor } from '@app/shared/interceptors/logging.interceptor';
@Module({
  // import the BooksModule and AuthModule and assign the prometheus to export the default data to /metrics
  imports: [BooksModule, AuthModule, PrometheusModule.register()],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERTCEPTOR',
      useClass: ErrorInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },

  ],
})
export class AppModule {}
