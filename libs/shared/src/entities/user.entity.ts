// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { hash } from 'bcrypt';
import { Book } from './book.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  // A user can have multiple books in their reading list
  @ManyToMany(() => Book, { eager: true })
  @JoinTable()
  readingBooks: Book[];

  // A user can have multiple books as an author
  @OneToMany(() => Book, (book) => book.author, {
    eager: true,
    cascade: ['remove', 'update'],
  })
  writtenBooks: Book[];

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
}
