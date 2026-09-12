import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  contact!: string;

  @ApiProperty()
  parentEmail!: string;

  @ApiPropertyOptional()
  image!: string | null;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  facultyId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ImportErrorDto {
  @ApiProperty()
  email!: string;

  @ApiProperty()
  reason!: string;
}

export class ImportStudentsResponseDto {
  @ApiProperty()
  created!: number;

  @ApiProperty({ type: [ImportErrorDto] })
  errors!: ImportErrorDto[];
}
