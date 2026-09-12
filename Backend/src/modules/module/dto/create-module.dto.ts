import { IsNotEmpty, IsString, IsOptional, MinLength, IsArray, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introduction to Computer Science', minLength: 2 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'CS101' })
  @Trim()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Dr. John Smith' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  moduleLeader!: string;

  @ApiProperty({ example: 'uuid-of-faculty' })
  @IsString()
  @IsNotEmpty()
  facultyId!: string;

  @ApiPropertyOptional({ example: [1, 2], default: [1] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  semesters?: number[];
}
