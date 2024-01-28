import { DynamicModule, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresDBModule } from './modules/postgresdb.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

/**
 * SharedModule is a module in the NestJS application.
 * It provides shared functionality that can be used by other modules.
 *
 *
 * The SharedModule class has the following static method:
 *
 * registerRmq(service: string, queue: string): DynamicModule - This method creates a dynamic module that provides a RabbitMQ client proxy.
 * The client proxy is configured to connect to a specific RabbitMQ queue.
 * The method takes two parameters: the name of the service that the client proxy will be provided under, and the name of the RabbitMQ queue to connect to.
 * The method returns a DynamicModule, which is a module that can be created and configured at runtime.
 *
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    PostgresDBModule,
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {
  static registerRmq(service: string, queue: string): DynamicModule {
    const providers = [
      {
        provide: service,
        useFactory: (configService: ConfigService) => {
          const USER = configService.get('RABBITMQ_USER');
          const PASSWORD = configService.get('RABBITMQ_PASS');
          const HOST = configService.get('RABBITMQ_HOST');

          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
              queue,
              queueOptions: {
                durable: true, // queue survives broker restart
              },
            },
          });
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: SharedModule,
      providers,
      exports: providers,
    };
  }
}
