import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, SharedModule, User } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([User, Book]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, JwtGuard, JwtStrategy],
})
export class AuthServiceModule {}
