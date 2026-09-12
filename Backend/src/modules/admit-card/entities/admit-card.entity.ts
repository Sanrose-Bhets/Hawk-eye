import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdmitCardEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  examRoutineId!: string;

  @ApiPropertyOptional()
  seatNumber?: string;

  @ApiPropertyOptional()
  roomName?: string;

  @ApiPropertyOptional()
  pdfKey?: string;

  @ApiProperty()
  generatedBy!: string;

  @ApiPropertyOptional()
  studentName?: string;

  @ApiPropertyOptional()
  studentEmail?: string;

  @ApiPropertyOptional()
  moduleName?: string;

  @ApiPropertyOptional()
  moduleCode?: string;

  @ApiPropertyOptional()
  facultyName?: string;

  @ApiPropertyOptional()
  examDate?: unknown;

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiPropertyOptional()
  duration?: string;

  @ApiProperty()
  createdAt!: unknown;

  @ApiProperty()
  updatedAt!: unknown;
}
