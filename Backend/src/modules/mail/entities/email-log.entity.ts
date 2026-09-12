import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailLogEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  to!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  body!: string;

  @ApiPropertyOptional()
  studentId!: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  error!: string | null;

  @ApiProperty()
  createdAt!: unknown;
}
