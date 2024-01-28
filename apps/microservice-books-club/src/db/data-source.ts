import { Book, User } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const configService = new ConfigService();

const DATABASE_HOST = configService.get('DB_HOST');
const DATABASE_PORT = configService.get('DB_PORT');
const DATABASE_USER = configService.get('DB_USERNAME');
const DATABASE_PASSWORD = configService.get('DB_PASSWORD');
const DATABASE_NAME = configService.get('DB_NAME');


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT),
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  entities: [User, Book],
  migrations: ['dist/apps/microservice-books-club/db/migrations/*.js'],
};

export const dataSource = new DataSource(dataSourceOptions);
