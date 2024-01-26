import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadBookDto {
  @IsNotEmpty()
  @IsNumber()
  bookId: number;

  userId: number;
}
