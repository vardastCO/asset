import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  Entity,
  JoinColumn,
  Index,
  BaseEntity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";




@ObjectType()
@Entity("product_file_temporary")
@Index(["product_temp_id", "file_id"], { unique: true }) 
export class ProductFileTemporary extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true }) 
  file_id: number;

  @Field(() => Int, { nullable: true }) 
  @Column({ nullable: true }) 
  product_temp_id: number;
}
