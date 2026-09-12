import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class CreateExamRoutineDto {
  @ApiProperty({ example: '2026-09-20' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: '09:00' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '11:00' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiProperty({ example: 'faculty-uuid-here' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  facultyId!: string;

  @ApiProperty({ example: 'module-uuid-here' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  moduleId!: string;
}
