import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class GenerateAdmitCardsDto {
  @ApiProperty({ example: 'faculty-uuid-here' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  facultyId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  semester!: number;

  @ApiPropertyOptional({ example: 'class-uuid-here' })
  @Trim()
  @IsString()
  @IsOptional()
  classId?: string;
}

export class GenerateSingleAdmitCardDto {
  @ApiPropertyOptional({ example: 'class-uuid-here' })
  @Trim()
  @IsString()
  @IsOptional()
  classId?: string;
}
