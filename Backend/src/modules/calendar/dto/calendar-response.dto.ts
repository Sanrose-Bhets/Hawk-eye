import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarNoteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  rteId!: string;

  @ApiProperty()
  date!: unknown;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  content!: string | null;

  @ApiProperty()
  createdAt!: unknown;

  @ApiProperty()
  updatedAt!: unknown;
}

export class PaginatedCalendarNoteResponseDto {
  @ApiProperty({ type: [CalendarNoteResponseDto] })
  data!: CalendarNoteResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
