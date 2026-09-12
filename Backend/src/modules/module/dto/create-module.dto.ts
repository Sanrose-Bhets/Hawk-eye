import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
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
}
