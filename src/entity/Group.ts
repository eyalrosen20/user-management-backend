import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./User";

export enum GroupStatus {
  EMPTY = "empty",
  NOT_EMPTY = "notEmpty"
}

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: GroupStatus,
    default: GroupStatus.NOT_EMPTY
  })
  status!: GroupStatus;

  @OneToMany(() => User, user => user.group)
  users!: User[];
}
