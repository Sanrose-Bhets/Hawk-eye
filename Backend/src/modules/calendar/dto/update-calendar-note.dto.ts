import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class UpdateCalendarNoteDto {
  @ApiPropertyOptional({ example: '2026-09-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'Updated meeting title' })
  @Trim()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @Trim()
  @IsString()
  @IsOptional()
  content?: string;
}
