import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors({
    origin: '*',
  });

  // use validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // set global prefix
  app.setGlobalPrefix('api/v1');

  // use global error interceptor
  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
