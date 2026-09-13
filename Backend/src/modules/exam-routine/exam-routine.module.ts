import { Module } from '@nestjs/common';
import { ExamRoutineController } from './exam-routine.controller.js';
import { ExamRoutineService } from './exam-routine.service.js';
import { ExamRoutineRepository } from './repositories/exam-routine.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';
import { EXAM_ROUTINE_REPOSITORY } from './constants/exam-routine.constants.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import { ModuleRepository } from '../module/repositories/module.repository.js';
import { FacultyRepository } from '../faculty/repositories/faculty.repository.js';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ExamRoutineController],
  providers: [
    ExamRoutineService,
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
  ],
  exports: [ExamRoutineService],
})
export class ExamRoutineModule {}
