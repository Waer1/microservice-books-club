import { IsNotEmpty, IsNumber } from 'class-validator';

export class RelocateMeDto   {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  userId: number;
}
