import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['STUDENT', 'STUDENT_SERVICE', 'RTE'] })
  role!: string;

  @ApiProperty({ required: false, nullable: true })
  facultyId?: string | null;
}
