import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'asset_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Enable the event pattern
  app.enableShutdownHooks();

  // Use startAllMicroservices instead of startAllMicroservicesAsync
  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
