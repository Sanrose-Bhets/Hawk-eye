import { ApiProperty } from '@nestjs/swagger';

export class SeatPositionDto {
  @ApiProperty({ example: 'A1' })
  label!: string;

  @ApiProperty({ example: 100 })
  x!: number;

  @ApiProperty({ example: 200 })
  y!: number;
}

export class SeatAssignmentDto {
  @ApiProperty({ example: 0 })
  seatIndex!: number;

  @ApiProperty({ example: 'Alice Johnson' })
  studentName!: string;

  @ApiProperty({ example: 'alice@example.com' })
  studentEmail!: string;
}

export class FloorPlanResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [SeatPositionDto] })
  seats!: SeatPositionDto[];

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ClassResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  floorPlanId!: string;

  @ApiProperty({ type: [SeatAssignmentDto] })
  assignments!: SeatAssignmentDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
