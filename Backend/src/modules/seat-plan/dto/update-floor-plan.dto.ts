import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UpdateSeatPositionDto {
  @ApiPropertyOptional({ example: 'A1' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNotEmpty()
  x!: number;

  @ApiPropertyOptional({ example: 200 })
  @IsNotEmpty()
  y!: number;
}

export class UpdateFloorPlanDto {
  @ApiPropertyOptional({ example: 'Room 101 Layout' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: [UpdateSeatPositionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSeatPositionDto)
  seats?: UpdateSeatPositionDto[];
}
