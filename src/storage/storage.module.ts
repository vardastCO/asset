import { Module } from "@nestjs/common";
import { NestMinioModule } from "nestjs-minio";
import { FileModule } from "./file/file.module";
import { storageAsyncConfig } from "src/config/storage.config";
import { DirectoryModule } from './directory/directory.module';
import { AppController } from "./file/app.controller";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  imports: [NestMinioModule.registerAsync(storageAsyncConfig), FileModule, DirectoryModule],
  controllers: [AppController],
  providers: [ 
    CompressionService,
    DecompressionService
  ],
})
export class StorageModule {}
