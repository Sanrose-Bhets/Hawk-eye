import { ApiProperty } from '@nestjs/swagger';

export class ExamRoutineResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  rteId!: string;

  @ApiProperty()
  date!: unknown;

  @ApiProperty()
  startTime!: string;

  @ApiProperty()
  endTime!: string;

  @ApiProperty()
  duration!: string;

  @ApiProperty()
  facultyId!: string;

  @ApiProperty()
  moduleId!: string;

  @ApiProperty()
  createdAt!: unknown;

  @ApiProperty()
  updatedAt!: unknown;
}
