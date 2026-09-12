import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamRoutineEntity {
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

  @ApiPropertyOptional()
  moduleName?: string;

  @ApiPropertyOptional()
  facultyName?: string;

  @ApiProperty()
  createdAt!: unknown;

  @ApiProperty()
  updatedAt!: unknown;
}
