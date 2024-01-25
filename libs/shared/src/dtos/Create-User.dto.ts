import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsStrongPassword,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';

  export class CreateUserDto {
    @ApiProperty({ description: 'The name of the user.' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The email of the user.' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user.' })
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

    @ApiProperty({ description: "The latitude of the user's location." })
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: "The longitude of the user's location." })
    @IsNotEmpty()
    @IsNumber()
    longitude: number;
  }
