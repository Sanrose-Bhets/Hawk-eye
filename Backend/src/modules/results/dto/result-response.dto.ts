import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResultItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  moduleId!: string;

  @ApiProperty()
  moduleName!: string;

  @ApiPropertyOptional()
  moduleCode!: string | null;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  grade!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class ResultResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  studentEmail!: string;

  @ApiProperty()
  published!: boolean;

  @ApiProperty({ type: [ResultItemResponseDto] })
  items!: ResultItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedResultResponseDto {
  @ApiProperty({ type: [ResultResponseDto] })
  data!: ResultResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ImportErrorDto {
  @ApiProperty()
  studentEmail!: string;

  @ApiProperty()
  moduleCode!: string;

  @ApiProperty()
  reason!: string;
}

export class ImportResultsResponseDto {
  @ApiProperty()
  created!: number;

  @ApiProperty({ type: [ImportErrorDto] })
  errors!: ImportErrorDto[];
}
