import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailLogResponseDto {
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

export class PaginatedEmailLogResponseDto {
  @ApiProperty({ type: [EmailLogResponseDto] })
  data!: EmailLogResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class MailStatsResponseDto {
  @ApiProperty()
  totalSent!: number;

  @ApiProperty()
  totalQueued!: number;

  @ApiProperty()
  totalFailed!: number;
}

export class SendMailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  message!: string;
}
