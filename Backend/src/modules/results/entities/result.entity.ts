import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResultItemEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  moduleId!: string;

  @ApiProperty()
  moduleName!: string;

  @ApiPropertyOptional()
  moduleCode!: string | null;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  grade!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class ResultEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  studentEmail!: string;

  @ApiProperty()
  published!: boolean;

  @ApiProperty({ type: [ResultItemEntity] })
  items!: ResultItemEntity[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
