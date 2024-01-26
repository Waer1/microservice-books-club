import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateBookDto {
  @IsNotEmpty()
  @IsNumber()
  BookId: number;

  ownerId: number;

  updates: {
    title?: string;
    description?: string;
  };
}
