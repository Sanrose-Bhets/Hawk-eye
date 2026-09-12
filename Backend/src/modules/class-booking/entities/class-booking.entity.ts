import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassBookingEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  classId!: string;

  @ApiPropertyOptional()
  className?: string;

  @ApiProperty()
  bookedBy!: string;

  @ApiPropertyOptional()
  bookedByName?: string;

  @ApiProperty()
  purpose!: string;

  @ApiProperty()
  startTime!: Date;

  @ApiProperty()
  endTime!: Date;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
