import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host: 'localhost',
  //     port: 1057,
  //   },
  // });

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host: 'localhost',
  //     port: 3001,
  //   },
  // });

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host: 'localhost',
  //     port: 3003,
  //   },
  // });

  // enable cors
  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(new ValidationPipe());

  // set global prefix
  app.setGlobalPrefix('api/v1');

  // use http exception filter
  // app.useGlobalFilters(new HttpExceptionFilter());
  
  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
