import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ResultsController } from './results.controller.js';
import { ResultsService } from './results.service.js';
import { ResultsScheduler } from './results.scheduler.js';
import { ResultRepository } from './repositories/result.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StudentModule } from '../student/student.module.js';
import { ModuleModule } from '../module/module.module.js';
import { MailModule } from '../mail/mail.module.js';
import { RESULT_REPOSITORY } from './constants/results.constants.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    StudentModule,
    ModuleModule,
    MailModule,
  ],
  controllers: [ResultsController],
  providers: [
    ResultsService,
    ResultsScheduler,
    {
      provide: RESULT_REPOSITORY,
      useClass: ResultRepository,
    },
  ],
  exports: [ResultsService],
})
export class ResultsModule {}
