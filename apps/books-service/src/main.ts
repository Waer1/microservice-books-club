import { NestFactory } from '@nestjs/core';
import { BooksServiceModule } from './books-service.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(BooksServiceModule);

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_BOOKS_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
  console.log(`Books service is listening to queue ${queue}`);
}
bootstrap();
