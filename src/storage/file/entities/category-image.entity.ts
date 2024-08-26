import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./file.entity";

@ObjectType()
@Entity("category_images")
@Index(["categoryId", "fileId"], { unique: true }) 
export class ImageCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  @Index()
  @Column()
  categoryId: number;

  @Field(() => Int)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;
}
