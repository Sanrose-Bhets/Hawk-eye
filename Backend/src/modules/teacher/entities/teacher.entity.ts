import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: [String] })
  facultyIds!: string[];

  @ApiProperty({ type: [String] })
  moduleIds!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
