import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UpdateSeatAssignmentDto {
  @ApiPropertyOptional({ example: 0 })
  @IsNotEmpty()
  seatIndex!: number;

  @ApiPropertyOptional({ example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @ApiPropertyOptional({ example: 'alice@example.com' })
  @IsString()
  @IsNotEmpty()
  studentEmail!: string;
}

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 'Grade 10 - Section A' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'floor-plan-uuid' })
  @IsString()
  @IsOptional()
  floorPlanId?: string;

  @ApiPropertyOptional({ type: [UpdateSeatAssignmentDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSeatAssignmentDto)
  assignments?: UpdateSeatAssignmentDto[];
}
