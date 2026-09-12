import { Module } from '@nestjs/common';
import { ExamRoutineController } from './exam-routine.controller.js';
import { ExamRoutineService } from './exam-routine.service.js';
import { ExamRoutineRepository } from './repositories/exam-routine.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EXAM_ROUTINE_REPOSITORY } from './constants/exam-routine.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [ExamRoutineController],
  providers: [
    ExamRoutineService,
    {
      provide: EXAM_ROUTINE_REPOSITORY,
      useClass: ExamRoutineRepository,
    },
  ],
  exports: [ExamRoutineService],
})
export class ExamRoutineModule {}
