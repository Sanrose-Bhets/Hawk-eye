import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentEntity {
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
  semester!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
