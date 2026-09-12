import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim, Lowercase } from '../../../common/transformers/index.js';
import { IsPhoneNumber } from '../../../common/validators/index.js';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Aarav Sharma', minLength: 2 })
  @Trim()
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'aarav@example.com' })
  @Trim()
  @Lowercase()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({ example: 'Kathmandu, Nepal' })
  @Trim()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+977-9841234567' })
  @Trim()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  contact?: string;

  @ApiPropertyOptional({ example: 'parent@example.com' })
  @Trim()
  @Lowercase()
  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @ApiPropertyOptional({ example: '/uploads/students/image.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'uuid-of-faculty' })
  @IsString()
  @IsOptional()
  facultyId?: string;
}
