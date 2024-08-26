import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloDriver,
} from "@nestjs/apollo";
import { typeOrmAsyncConfig } from './typeorm.config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { StorageModule } from './storage/storage.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { cacheAsyncConfig } from "./config/cache.config";
import { I18nModule } from "nestjs-i18n";
import { i18nConfig } from "./config/i18n.config";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      introspection: true,
      playground: true,
      context: ({ req }) => {
        // console.log('Request object:', req.body.query);
        return { req };
      },
    }),
    ClientsModule.register([
    {
      name: 'asset_service',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'asset_queue', 
        queueOptions: {
          durable: true
        },
      },
    },
  ]),
  StorageModule,
  UtilitiesModule , 
  CacheModule.registerAsync(cacheAsyncConfig),
  I18nModule.forRoot(i18nConfig),
  ],
})
export class AppModule {}