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

  // A book can have only one author (User)
  @ManyToOne(() => User, (user) => user.writtenBooks, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  author: User;
}
