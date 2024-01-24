import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const NODE_ENV = configService.get('NODE_ENV');
        const DATABASE_HOST = configService.get('DB_HOST');
        const DATABASE_PORT = configService.get('DB_PORT');
        const DATABASE_USER = configService.get('DB_USERNAME');
        const DATABASE_PASSWORD = configService.get('DB_PASSWORD');
        const DATABASE_NAME = configService.get('DB_NAME');
        return {
          type: 'postgres',
          host: DATABASE_HOST,
          port: parseInt(DATABASE_PORT),
          username: DATABASE_USER,
          password: DATABASE_PASSWORD,
          database: DATABASE_NAME,
          autoLoadEntities: true,
          synchronize: NODE_ENV !== 'production',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PostgresDBModule {}
