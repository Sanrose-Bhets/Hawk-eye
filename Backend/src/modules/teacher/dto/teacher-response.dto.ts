import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ type: [String] })
  facultyIds!: string[];

  @ApiPropertyOptional({ type: [String] })
  moduleIds!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedTeacherResponseDto {
  @ApiProperty({ type: [TeacherResponseDto] })
  data!: TeacherResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
