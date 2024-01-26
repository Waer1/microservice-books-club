import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteBookDto {
  @IsNotEmpty()
  @IsNumber()
  BookId: number;


  ownerId: number;
}
