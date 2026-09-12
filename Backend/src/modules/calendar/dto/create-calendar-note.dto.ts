import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class CreateCalendarNoteDto {
  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 'Exam review meeting' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Discuss exam preparation with team' })
  @Trim()
  @IsString()
  @IsOptional()
  content?: string;
}
