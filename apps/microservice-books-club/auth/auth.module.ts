import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SharedModule } from '@app/shared';

@Module({
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
