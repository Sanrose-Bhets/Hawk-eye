import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SeatPositionDto {
  @ApiProperty({ example: 'A1' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  x!: number;

  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  y!: number;
}

export class CreateFloorPlanDto {
  @ApiProperty({ example: 'Room 101 Layout' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: [SeatPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatPositionDto)
  seats!: SeatPositionDto[];

  @ApiProperty({ example: 'admin-user-id' })
  @IsString()
  @IsNotEmpty()
  createdBy!: string;
}
