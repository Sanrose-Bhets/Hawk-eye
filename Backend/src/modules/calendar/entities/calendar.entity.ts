import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarNoteEntity {
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
