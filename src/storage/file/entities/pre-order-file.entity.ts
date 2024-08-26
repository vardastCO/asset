import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  JoinColumn,
  Entity,
  OneToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./file.entity";

@ObjectType()
@Entity("pre_order_file")
export class PreOrderFile extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Index()
  @Column()
  pre_order_id: number;

  @Field(() => Int)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Field()
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 

}
