import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class CreateFacultyDto {
  @ApiProperty({ example: 'Faculty of Science', minLength: 2 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Science and technology faculty' })
  @Trim()
  @IsString()
  @IsOptional()
  description?: string;
}
