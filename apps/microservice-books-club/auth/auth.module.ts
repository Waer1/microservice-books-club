import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SharedModule } from '@app/shared';

@Module({
  // assign the RabbitMQ queues (Auth ) to the AuthController
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
