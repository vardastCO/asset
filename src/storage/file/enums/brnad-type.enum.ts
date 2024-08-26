import { registerEnumType } from "@nestjs/graphql";

export enum BrandTypeEnum {
  LOGO = 'LOGO',
  CATALOGUE = 'CATALOGUE',
  PRICELIST = 'PRICELIST',
  DESKTOPBANNER = 'DESKTOPBANNER',
  MOBILEBANNER = 'MOBILEBANNER'
}

registerEnumType(BrandTypeEnum, {
  name: "BrandTypeEnum",
});
