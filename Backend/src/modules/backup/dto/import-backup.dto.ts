import {
  IsObject,
  IsString,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StudentBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() password!: string;
  @ApiProperty() address!: string;
  @ApiProperty() contact!: string;
  @ApiProperty() parentEmail!: string;
  @ApiPropertyOptional() image!: string | null;
  @ApiProperty() imageBase64?: string;
  @ApiProperty() role!: string;
  @ApiPropertyOptional() facultyId!: string | null;
  @ApiProperty() semester!: number;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class FacultyBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() description!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class ModuleBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() code!: string | null;
  @ApiProperty() moduleLeader!: string;
  @ApiProperty() facultyId!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class ModuleSemesterBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() moduleId!: string;
  @ApiProperty() semester!: number;
}

class ResultBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() studentId!: string;
  @ApiProperty() published!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class ResultItemBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() resultId!: string;
  @ApiProperty() moduleId!: string;
  @ApiProperty() score!: number;
  @ApiProperty() grade!: string;
  @ApiProperty() createdAt!: string;
}

class FloorPlanBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() seats!: unknown;
  @ApiProperty() createdBy!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class ClassBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() floorPlanId!: string;
  @ApiProperty() assignments!: unknown;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class ExamRoutineBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() rteId!: string;
  @ApiProperty() date!: string;
  @ApiProperty() startTime!: string;
  @ApiProperty() endTime!: string;
  @ApiProperty() duration!: string;
  @ApiProperty() facultyId!: string;
  @ApiProperty() moduleId!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class CalendarNoteBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() rteId!: string;
  @ApiProperty() date!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() content!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class EmailLogBackupDto {
  @ApiProperty() id!: string;
  @ApiProperty() to!: string;
  @ApiProperty() subject!: string;
  @ApiProperty() body!: string;
  @ApiPropertyOptional() studentId!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() error!: string | null;
  @ApiProperty() createdAt!: string;
}

class BackupDataDto {
  @ApiProperty({ type: [StudentBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentBackupDto)
  students!: StudentBackupDto[];

  @ApiProperty({ type: [FacultyBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacultyBackupDto)
  faculties!: FacultyBackupDto[];

  @ApiProperty({ type: [ModuleBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleBackupDto)
  modules!: ModuleBackupDto[];

  @ApiProperty({ type: [ModuleSemesterBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleSemesterBackupDto)
  moduleSemesters!: ModuleSemesterBackupDto[];

  @ApiProperty({ type: [ResultBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultBackupDto)
  results!: ResultBackupDto[];

  @ApiProperty({ type: [ResultItemBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultItemBackupDto)
  resultItems!: ResultItemBackupDto[];

  @ApiProperty({ type: [FloorPlanBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorPlanBackupDto)
  floorPlans!: FloorPlanBackupDto[];

  @ApiProperty({ type: [ClassBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassBackupDto)
  classes!: ClassBackupDto[];

  @ApiProperty({ type: [ExamRoutineBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamRoutineBackupDto)
  examRoutines!: ExamRoutineBackupDto[];

  @ApiProperty({ type: [CalendarNoteBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalendarNoteBackupDto)
  calendarNotes!: CalendarNoteBackupDto[];

  @ApiProperty({ type: [EmailLogBackupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailLogBackupDto)
  emailLogs!: EmailLogBackupDto[];
}

export class ImportBackupDto {
  @ApiProperty({ example: '1.0' })
  @IsString()
  version!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00Z' })
  @IsString()
  exportedAt!: string;

  @ApiProperty({ type: BackupDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BackupDataDto)
  data!: BackupDataDto;
}
