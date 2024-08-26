import { Module } from "@nestjs/common";
import { FileResolver } from "./file.resolver";
import { FileService } from "./file.service";
import { PublicFileService } from "./public-file.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  providers: [ 
    FileResolver,
    FileService,
    PublicFileService,
    CompressionService,
    DecompressionService
  ],
  exports: [FileService],
})
export class FileModule {}
