import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SeatAssignmentDto {
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  seatIndex!: number;

  @ApiProperty({ example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsString()
  @IsNotEmpty()
  studentEmail!: string;
}

export class CreateClassDto {
  @ApiProperty({ example: 'Grade 10 - Section A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'floor-plan-uuid' })
  @IsString()
  @IsNotEmpty()
  floorPlanId!: string;

  @ApiPropertyOptional({ type: [SeatAssignmentDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SeatAssignmentDto)
  assignments?: SeatAssignmentDto[];
}
