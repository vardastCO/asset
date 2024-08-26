import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { Directory } from "./storage/directory/entities/directory.entity";
import { File } from "./storage/file/entities/file.entity";
import { Image } from "./storage/file/entities/image-product.entity";
import { ImageCategory } from "./storage/file/entities/category-image.entity";
import { Banner } from "./storage/file/entities/banners.entity";
import { BrandFile } from "./storage/file/entities/brand-file.entity";
import { SellerFile } from "./storage/file/entities/seller-file.entity";
import { ProductFileTemporary } from "./storage/file/entities/product-file-temporary";
import { PreOrderFile } from "./storage/file/entities/pre-order-file.entity";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: "postgres",
      host: configService.get("DB_HOST", "database"),
      port: parseInt(configService.get("DB_PORT", "5432")),
      username: configService.get("DB_USERNAME", "postgres"),
      password: configService.get("DB_PASSWORD", "vardast@1234"),
      database: configService.get("DB_NAME", "v2"),
      synchronize: configService.get("DB_SYNC", "false") === "true",
      logging: configService.get("DB_QUERY_LOG", "false") === "true",
      entities: [
        Directory,
        File,
        Image,
        ImageCategory,
        BrandFile,
        SellerFile,
        Banner,
        ProductFileTemporary,
        PreOrderFile
      ],
    };
  },
};
