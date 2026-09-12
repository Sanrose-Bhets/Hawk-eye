import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../../common/transformers/index.js';

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'Faculty of Science', minLength: 2 })
  @Trim()
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Science and technology faculty' })
  @Trim()
  @IsString()
  @IsOptional()
  description?: string;
}
