import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./file.entity";

@ObjectType()
@Entity("product_images")
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  @Index()
  @Column()
  productId: number;


  @Field(() => Int)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column("int4", { default: 0 })
  sort: number;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isPublic: boolean;
}
