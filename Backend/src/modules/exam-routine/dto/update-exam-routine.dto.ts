import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class UpdateExamRoutineDto {
  @ApiPropertyOptional({ example: '2026-09-20' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @Trim()
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @Trim()
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ example: 'faculty-uuid-here' })
  @Trim()
  @IsString()
  @IsOptional()
  facultyId?: string;

  @ApiPropertyOptional({ example: 'module-uuid-here' })
  @Trim()
  @IsString()
  @IsOptional()
  moduleId?: string;
}
