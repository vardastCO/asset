import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import {  In } from 'typeorm';
import { Image } from './entities/image-product.entity';
import { ImageCategory } from './entities/category-image.entity';
import { File } from './entities/file.entity';
import {  SellerFile } from './entities/seller-file.entity';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { DataSource, IsNull } from "typeorm";
import { Banner } from './entities/banners.entity';
import { SellerTypeEnum } from './enums/seller-type.enum';
import { BrandFile } from './entities/brand-file.entity';
import { PreOrderFile } from './entities/pre-order-file.entity';

const ImgProxy = require('imgproxy').default;
@Controller()
export class AppController {
  imgproxy: any; // Declare imgproxy instance variable
  
  constructor(
    private readonly compressionService: CompressionService,
    private readonly dataSource: DataSource,
    private readonly decompressionService: DecompressionService,
  ) {

    this.imgproxy = new ImgProxy({
      baseUrl: process.env.IMGPROXY_BASE_URL,
      key: process.env.IMGPROXY_KEY,
      salt: process.env.IMGPROXY_SALT,
      encode: true
    });
  }

  @MessagePattern({ cmd: 'getImageProduct' })
  async getImageProduct(@Payload() data: any, @Ctx() context: any)  {
    try {
      // Extract productIds from the data object
      const productIds: number[] = data.productIds;

      const images = await Image.find({
        where: {
          productId: In(productIds)
        },
        order : {
         sort : 'ASC'
        },
        relations : ['file']
      });
      console.log('images',images)
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
      const imageUrlsWithProductId = await Promise.all(images.map(async image => {
        const file = await image.file;
        const imgUrl = this.imgproxy.builder().generateUrl(`${BASE_IMAGE_URL}/${file.name}`);
        return {
          id:image.id,
          productId: image.productId,
          imageUrl: imgUrl
        };
      }));
      
      return imageUrlsWithProductId;
      
    } catch (error) {
      console.error('Error fetching getImageProduct:', error);

    }
  }
  @MessagePattern({ cmd: 'remove_image_product' })
  async remove_image_product(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);
      const image: Image = await Image.findOneBy({ 
        id: input.id,
        });
        if (!image) {
          console.log('not found image')
            return false
        }
      await image.remove();
      return true;
      
    } catch (error) {
      console.error('Error fetching remove_image_product:', error);

    }
  }
  async getNewlyUploadedFileOrFail(
    directory: string,
    uuid: string,
    modelType: string,
    createdById: number,
    customErrorMessageOnFailure?: string,
  ): Promise<File> {
    const file = await File.getNewlyUploadedFile(
      directory,
      uuid,
      modelType,
      createdById,
    );

    if (!file) {
      return null
    }

    return file;
    
  }

  @MessagePattern({ cmd: 'create_image_category' })
  async create_image_category(@Payload() data: any, @Ctx() context: any)  {
    try {
      const createCategoryInput = this.decompressionService.decompressData(data.data);

      const file = await this.getNewlyUploadedFileOrFail(
        "product/image/files",
        createCategoryInput.file,
        "Image",
        createCategoryInput.user.id,
      );

      const imageCategory: ImageCategory = ImageCategory.create<ImageCategory>();
      imageCategory.categoryId = createCategoryInput.decompressedResultData.id
      imageCategory.fileId = file.id
      await imageCategory.save()
      return true
    } catch (error) {
      return false
    }
  }

  
  @MessagePattern({ cmd: 'getImageCategory' })
  async getImageCategory(@Payload() data: any, @Ctx() context: any)  {
    try {
      const categoryIds = this.decompressionService.decompressData(data.data).categoryIds

      const categoriesIds: number[] = categoryIds;

      const images = await ImageCategory.find({
        where: {
          categoryId: In(categoriesIds)
        },
        relations : ['file']
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
      const imageUrlsWithCategoryId = await Promise.all(images.map(async image => {
        const file = await image.file;
        const imgUrl = this.imgproxy.builder()
        
        .generateUrl(`${BASE_IMAGE_URL}/${file.name}`);
        return {
          id: image.categoryId,
          imageUrl: imgUrl
        };
      }));
      const compressedResponse = this.compressionService.compressData(imageUrlsWithCategoryId);
     
      return compressedResponse;
      
    } catch (error) {
      console.error('Error fetching images:', error);
    
    }
  }

  @MessagePattern({ cmd: 'getBrandFiles' })
  async getBrandFiles(@Payload() data: any, @Ctx() context: any)  {
    try {
      const decompressData = this.decompressionService.decompressData(data.data)

      const brandFiles = await BrandFile.find({
        where: {
          brandId: In(decompressData.brandIds)
        },
        relations : ['file']
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
      const imageUrlsWithBrandId = await Promise.all(brandFiles.map(async (brandFile) => {
        try {
          const files = await brandFile.file;
          if (!files) {
            throw new Error('File not found for brandFile');
          }
          const fullUrl = this.imgproxy.builder()
            .generateUrl(`${BASE_IMAGE_URL}/${files.name}`);
          return {
            id : brandFile.id,
            brandId: brandFile.brandId,
            name: brandFile.name,
            type: brandFile.type,
            fullUrl: fullUrl,
            create_at: new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"})
          };
        } catch (innerError) {
          console.error('Error processing getBrandFiles:', innerError);
          return null;
        }
      }));
      
      return imageUrlsWithBrandId;
      
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

  
  @MessagePattern({ cmd: 'getSellerFiles' })
  async getSellerFiles(@Payload() data: any, @Ctx() context: any)  {
    try {
      const decompressData = this.decompressionService.decompressData(data.data)

      const sellerFile = await SellerFile.find({
        where: {
          sellerId: In(decompressData.sellerIds)
        },
        relations : ['file']
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
      const imageUrlsWithBrandId = await Promise.all(sellerFile.map(async (sellerFile) => {
        try {
          const files = await sellerFile.file;
          if (!files) {
            throw new Error('File not found for brandFile');
          }
          const fullUrl = this.imgproxy.builder()
            .generateUrl(`${BASE_IMAGE_URL}/${files.name}`);
          return {
            id : sellerFile.id,
            sellerId: sellerFile.sellerId,
            name: sellerFile.name,
            type: sellerFile.type,
            fullUrl: fullUrl
          };
        } catch (innerError) {
          console.error('Error processing getSellerFiles:', innerError);
          return null;
        }
      }));
      
      return imageUrlsWithBrandId;
      
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

  @MessagePattern({ cmd: 'remove_brand_file' })
  async remove_brand_file(@Payload() data: any, @Ctx() context: any) {
    const input = this.decompressionService.decompressData(data.data);
    const id = input.id;

    const brand: BrandFile = await BrandFile.findOneBy({ id: id });
    if (!brand) {
      return false
    }
    await brand.remove()
    return true
  }

  @MessagePattern({ cmd: 'remove_file_order' })
  async remove_file_order(@Payload() data: any, @Ctx() context: any) {
    const input = this.decompressionService.decompressData(data.data);
    const id = input.id;

    const files: PreOrderFile = await PreOrderFile.findOneBy({ id: id });
    if (!files) {
      return false
    }
    files.deleted_at = new Date().toISOString()
    await files.save()
    return true
  }

  @MessagePattern({ cmd: 'remove_seller_file' })
  async remove_seller_file(@Payload() data: any, @Ctx() context: any) {
    const input = this.decompressionService.decompressData(data.data);
    const id = input.id;

    const file: SellerFile = await SellerFile.findOneBy({ id: id });
    if (!file) {
      return false
    }
    await file.remove()
    return true
  }
  
  @MessagePattern({ cmd: 'add_file_order' })
  async add_file_order(@Payload() data: any, @Ctx() context: any)  {
    try {

      const decompressData = this.decompressionService.decompressData(data.data)
 
      const things         = new PreOrderFile()
      things.fileId       = decompressData.addFilePreOrderInput.file_id
      things.pre_order_id  = decompressData.addFilePreOrderInput.pre_order_id
     

      await things.save()
      
      return true;
      
    } catch (error) {
      console.error('Error fetching create_banners:', error);
      return false
     
    }
  }

  @MessagePattern({ cmd: 'create_banners' })
  async create_banners(@Payload() data: any, @Ctx() context: any)  {
    try {

      const decompressData = this.decompressionService.decompressData(data.data)

      const banner     = new Banner()
      banner.largeId   = decompressData.large_id
      banner.mediumId  = decompressData.medium_id
      banner.smallId   = decompressData.small_id
      banner.xlargeId  = decompressData.xlarge_id

      await banner.save()
      
      return true;
      
    } catch (error) {
      console.error('Error fetching create_banners:', error);
      return false
     
    }
  }

  @MessagePattern({ cmd: 'update_banners' })
  async update_banners(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data)

      const sql = `
      UPDATE banners
      SET 
          "smallId" = ${input.smallId},
          "mediumId" = ${input.mediumId},
          "largeId" = ${input.largeId},
          "xlargeId" = ${input.xlargeId}
      WHERE
          id = ${input.id}
      
      `;

      await this.dataSource.query(sql);
    

      return true;

      
    } catch (error) {
      console.error('Error fetching update_banners:', error);
     
    }
  }

  @MessagePattern({ cmd: 'getBanners' })
  async getBanners(@Payload() data: any, @Ctx() context: any)  {
    try {

      const banners = await Banner.find({
        take : 5,
        where : {
          deletedAt: IsNull()
        },
        relations:['small','medium','large','xlarge']
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
        const imageUrlsWithBanners = await Promise.all(banners.map(async banner => {
          const smallFile = await banner.small;
          const mediumFile = await banner.medium;
          const largeFile = await banner.large;
          const xlargeFile = await banner.xlarge;
      
          const smallDTO: any = {
              id: smallFile.id,
              uuid: smallFile.uuid,
              fullUrl: `${BASE_IMAGE_URL}/${smallFile.name}`
          };
      
          const mediumDTO: any = {
              id: mediumFile.id,
              uuid: mediumFile.uuid,
              fullUrl: `${BASE_IMAGE_URL}/${mediumFile.name}`
          };
      
          const largeDTO: any = {
              id: largeFile.id,
              uuid: largeFile.uuid,
              fullUrl: `${BASE_IMAGE_URL}/${largeFile.name}`
          };
      
          const xlargeDTO: any = {
              id: xlargeFile.id,
              uuid: xlargeFile.uuid,
              fullUrl:`${BASE_IMAGE_URL}/${xlargeFile.name}`
          };
      
          return {
              id: banner.id,
              small: smallDTO,
              medium: mediumDTO,
              large: largeDTO,
              xlarge: xlargeDTO
          };
      }));
     
      return this.compressionService.compressData(imageUrlsWithBanners);
      
    } catch (error) {
      console.error('Error fetching getBanners:', error);
    }
  }
  @MessagePattern({ cmd: 'find_file_order' })
  async find_file_order(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);
      const orderFile = await PreOrderFile.find({
        where : {
          pre_order_id: input.id,
          deleted_at: IsNull()
        },
        relations:['file']
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
    
        const res = await Promise.all(orderFile.map(async image => {
          const file = await image.file;
          const url = `${BASE_IMAGE_URL}/${file.name}`;

        return {
            id: image.id,
            url: url,
            
        };
      }));
     
      return this.compressionService.compressData(res);
      
    } catch (error) {
      console.error('Error fetching find_file_order:', error);
    }
  }
  @MessagePattern({ cmd: 'remove_banner' })
  async remove_banner(@Payload() data: any, @Ctx() context: any)  {
    try {
      let banner = await Banner.findOneBy({
         id : data.data.id
      });
      banner.deletedAt = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"})
      await banner.save()
      return true
      
    } catch (error) {
      console.error('Error fetching images:', error);
      return false;
    }
  }
  async findDirectoryId(input: string): Promise<number> {
    switch(input) {
        case "user/user/avatars":
           return 1 ;
        case "product/image/files":
           return 2 ;
        case "product/seller/logos":
           return 4 ;
        case "banner/mobile":
            return 6 ;
        case "product/brand/banner":
            return  7;
        case "product/seller/banner":
            return 8 ;
        case "brand/cataloge":
            return  9 ;
        case "brand/priceList":
            return 10 ;
        case "price/update":
            return 11 ;
        default:
            return 11;
    }
}

  @MessagePattern({ cmd: 'upload_files' })
  async upload_files(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);

      const directory_id = await this.findDirectoryId(input.type)

      const filename = File.generateNewFileName(input.mimetype);

      const fileRecord: File = File.create<File>({
        name: `${input.type}/${filename}`,
        originalName: filename,
        size: input.size,
        mimeType: input.mimetype,
        disk: "minio",
        bucketName: 'vardast',
        orderColumn : input.orderColumn ,
        directoryId : directory_id,
      });
  
  
      await this.dataSource.transaction(async () => {
        await fileRecord.save({ transaction: false });
      });
      const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL;
      fileRecord.url = `${BASE_IMAGE_URL}/${fileRecord.name}`

      return this.compressionService.compressData(fileRecord)
      
    } catch (error) {
      console.error('Error fetching upload_files:', error);
    }
  }
  
  @MessagePattern({ cmd: 'create_image_product' })
  async create_image_product(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);

      const image        = new Image()
      image.productId    = input.createImageInput.productId
      image.fileId       = input.createImageInput.fileId
      image.sort         = input.createImageInput.sort
      image.isPublic     = input.createImageInput.isPublic
      await image.save()
      return true
      
    } catch (error) {
      console.error('Error fetching images:', error);
     return false
    }
  }
  @MessagePattern({ cmd: 'update_image_product' })
  async update_image_product(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);
      console.log('input,',input)
      const image        =  await Image.findOneBy({id:input.imageId})


      image.sort = input.sort ?? 0
      await image.save()
      return true
      
    } catch (error) {
      console.error('Error fetching update_image_product:', error);
     return false
    }
  }
  @MessagePattern({ cmd: 'update_seller_file' })
  async update_seller_file(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);

      const sellerFile        = new SellerFile()
      sellerFile.sellerId     = input.createSellerFileInput.sellerId
      sellerFile.fileId       = input.createSellerFileInput.fileId
      sellerFile.type         = input.createSellerFileInput.type

      await sellerFile.save()
      return true
      
    } catch (error) {
      console.error('Error fetching update_seller_file:', error);
     return false
    }
  }
  @MessagePattern({ cmd: 'update_brand_file' })
  async update_brand_file(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);

      const brandFile     = new BrandFile()
      brandFile.brandId   = input.createBrandFileInput.brandId
      brandFile.fileId    = input.createBrandFileInput.fileId
      brandFile.type      = input.createBrandFileInput.type
      brandFile.create_at =  new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"})

      await brandFile.save()
      return true
      
    } catch (error) {
      console.error('Error fetching images:', error);
     return false
    }
  }

   @MessagePattern({ cmd: 'upload_logo_seller' })
  async upload_logo_seller(@Payload() data: any, @Ctx() context: any)  {
    try {
      const input = this.decompressionService.decompressData(data.data);

      const sellerFile      = new SellerFile()
      sellerFile.sellerId   = input.sellerId.id
      sellerFile.fileId     = input.becomeASellerInput.logo_fileId
      sellerFile.type       = SellerTypeEnum.LOGO

      await sellerFile.save()
      return true
      
    } catch (error) {
      console.error('Error fetching images:', error);
     return false
    }
  }

  
}
