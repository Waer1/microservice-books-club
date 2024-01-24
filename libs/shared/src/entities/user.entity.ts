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
} from 'typeorm';
import { Book } from './book.entity';
import { hash } from 'bcrypt';

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
  @ManyToMany(() => Book)
  @JoinTable()
  readingList: Book[];

  // A user can have multiple books as an author
  @OneToMany(() => Book, (book) => book.author)
  writtenList: Book[];

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
