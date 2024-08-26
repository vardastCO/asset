import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./file.entity";
import { UserTypeEnum } from "../enums/user-type.enum";

@ObjectType()
@Entity("user_files")
@Index(["userId", "fileId"], { unique: true }) 
export class UserFile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  
  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => Int)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Column({
    type: 'enum',
    enum: UserTypeEnum,
    default: UserTypeEnum.AVATAR 
  })
  type: UserTypeEnum;
}
