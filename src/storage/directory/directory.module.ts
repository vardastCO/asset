import { Module } from "@nestjs/common";
import { DirectoryResolver } from "./directory.resolver";
import { DirectoryService } from "./directory.service";

@Module({
  providers: [DirectoryResolver, DirectoryService],
})
export class DirectoryModule {}
