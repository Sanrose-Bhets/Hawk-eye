import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ImportResultItemDto {
  @ApiProperty({ description: 'Student email', example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  studentEmail!: string;

  @ApiProperty({ description: 'Module code', example: 'CS101' })
  @IsString()
  @IsNotEmpty()
  moduleCode!: string;

  @ApiProperty({ description: 'Score between 0 and 100', example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;
}

export class ImportResultsDto {
  @ApiProperty({ type: [ImportResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportResultItemDto)
  items!: ImportResultItemDto[];
}
