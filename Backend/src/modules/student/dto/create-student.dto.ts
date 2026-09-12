import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim, Lowercase } from '../../../common/transformers/index.js';
import { IsPhoneNumber } from '../../../common/validators/index.js';

export class CreateStudentDto {
  @ApiProperty({ example: 'Aarav Sharma', minLength: 2 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'aarav@example.com' })
  @Trim()
  @Lowercase()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: 'student123', minLength: 6, maxLength: 128 })
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(128)
  password?: string;

  @ApiProperty({ example: 'Kathmandu, Nepal' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: '+977-9841234567' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  contact!: string;

  @ApiProperty({ example: 'parent@example.com' })
  @Trim()
  @Lowercase()
  @IsEmail()
  @IsNotEmpty()
  parentEmail!: string;

  @ApiProperty({ example: 'uuid-of-faculty' })
  @IsString()
  @IsNotEmpty()
  facultyId!: string;
}
