import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModuleEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  code!: string | null;

  @ApiProperty()
  moduleLeader!: string;

  @ApiProperty()
  facultyId!: string;

  @ApiProperty()
  semesters!: number[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
