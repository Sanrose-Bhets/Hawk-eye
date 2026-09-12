import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class CreateClassBookingDto {
  @ApiProperty({ example: 'class-uuid-here' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @ApiProperty({ example: 'Physics lecture' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(1)
  durationMinutes!: number;
}
