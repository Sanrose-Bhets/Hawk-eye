import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateResultItemDto {
  @ApiProperty({ description: 'Module ID' })
  @IsString()
  @IsNotEmpty()
  moduleId!: string;

  @ApiProperty({ description: 'Score between 0 and 100', example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;
}

export class CreateResultDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ type: [CreateResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResultItemDto)
  items!: CreateResultItemDto[];
}
