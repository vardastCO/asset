import { registerEnumType } from "@nestjs/graphql";

export enum UserTypeEnum {
  AVATAR = 'AVATAR',
  EXTRA = 'EXTRA',
}

registerEnumType(UserTypeEnum, {
  name: "UserTypeEnum",
});
