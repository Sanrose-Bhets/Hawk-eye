import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SendMailDto {
  @ApiProperty({ description: 'Student ID to send email to their parent' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Exam Schedule Notice',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    description: 'Email body (HTML supported)',
    example: '<p>Hello, your exam is scheduled...</p>',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class SendBulkMailDto {
  @ApiProperty({ description: 'List of student IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  studentIds!: string[];

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ description: 'Email body (HTML supported)' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
