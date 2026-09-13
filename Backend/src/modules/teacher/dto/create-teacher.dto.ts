import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim, Lowercase } from '../../../common/transformers/index.js';

export class CreateTeacherDto {
  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'teacher@example.com' })
  @Trim()
  @Lowercase()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ type: [String], example: ['faculty-uuid'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  facultyIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['module-uuid'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  moduleIds?: string[];
}
