import { Module } from '@nestjs/common';
import { AdmitCardController } from './admit-card.controller.js';
import { AdmitCardService } from './admit-card.service.js';
import { AdmitCardRepository } from './repositories/admit-card.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ADMIT_CARD_REPOSITORY } from './constants/admit-card.constants.js';
import { STUDENT_REPOSITORY } from '../student/constants/student.constants.js';
import { EXAM_ROUTINE_REPOSITORY } from '../exam-routine/constants/exam-routine.constants.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import { CLASS_REPOSITORY } from '../seat-plan/constants/seat-plan.constants.js';
import { FILE_STORAGE } from '../../common/file-storage/file-storage.constants.js';
import { StudentRepository } from '../student/repositories/student.repository.js';
import { ExamRoutineRepository } from '../exam-routine/repositories/exam-routine.repository.js';
import { ModuleRepository } from '../module/repositories/module.repository.js';
import { FacultyRepository } from '../faculty/repositories/faculty.repository.js';
import { ClassRepository } from '../seat-plan/repositories/class.repository.js';
import { FileStorageModule } from '../../common/file-storage/file-storage.module.js';

@Module({
  imports: [PrismaModule, FileStorageModule],
  controllers: [AdmitCardController],
  providers: [
    AdmitCardService,
    {
      provide: ADMIT_CARD_REPOSITORY,
      useClass: AdmitCardRepository,
    },
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepository,
    },
    {
      provide: EXAM_ROUTINE_REPOSITORY,
      useClass: ExamRoutineRepository,
    },
    {
      provide: MODULE_REPOSITORY,
      useClass: ModuleRepository,
    },
    {
      provide: FACULTY_REPOSITORY,
      useClass: FacultyRepository,
    },
    {
      provide: CLASS_REPOSITORY,
      useClass: ClassRepository,
    },
  ],
  exports: [AdmitCardService],
})
export class AdmitCardModule {}
