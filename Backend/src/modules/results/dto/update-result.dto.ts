import {
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateResultItemDto {
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

export class UpdateResultDto {
  @ApiProperty({ type: [UpdateResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateResultItemDto)
  items!: UpdateResultItemDto[];
}
