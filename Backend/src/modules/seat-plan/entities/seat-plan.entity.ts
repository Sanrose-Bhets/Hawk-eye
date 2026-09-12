import { ApiProperty } from '@nestjs/swagger';

export interface SeatPosition {
  label: string;
  x: number;
  y: number;
}

export interface SeatAssignment {
  seatIndex: number;
  studentName: string;
  studentEmail: string;
}

export class FloorPlanEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [Object] })
  seats!: SeatPosition[];

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ClassEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  floorPlanId!: string;

  @ApiProperty({ type: [Object] })
  assignments!: SeatAssignment[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
