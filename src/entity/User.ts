import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Group } from "./Group";

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  BLOCKED = "blocked"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING
  })
  status!: UserStatus;

  @ManyToOne(() => Group, group => group.users, { nullable: true })
  group: Group | null = null;
}
