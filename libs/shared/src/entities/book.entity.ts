// book.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  AfterInsert,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.writtenBooks, {
    nullable: false,
    cascade: ['update'],
  })
  author: User;
}
