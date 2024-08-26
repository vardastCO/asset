import { registerEnumType } from "@nestjs/graphql";

export enum SellerTypeEnum {
  LOGO = 'LOGO',
  BANNER = 'BANNER',
  DESCKTOPBANNER = 'DESCKTOPBANNER',
}

registerEnumType(SellerTypeEnum, {
  name: "SellerTypeEnum",
});
