import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'ssd@islingtoncollege.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
