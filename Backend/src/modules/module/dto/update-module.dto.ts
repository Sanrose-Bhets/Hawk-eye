import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class UpdateModuleDto {
  @ApiPropertyOptional({
    example: 'Introduction to Computer Science',
    minLength: 2,
  })
  @Trim()
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'CS101' })
  @Trim()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  @Trim()
  @IsString()
  @IsOptional()
  moduleLeader?: string;

  @ApiPropertyOptional({ example: 'uuid-of-faculty' })
  @IsString()
  @IsOptional()
  facultyId?: string;
}
