import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller.js';
import { TeacherService } from './teacher.service.js';
import { TeacherRepository } from './repositories/teacher.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FacultyModule } from '../faculty/faculty.module.js';
import { ModuleModule } from '../module/module.module.js';
import { TEACHER_REPOSITORY } from './constants/teacher.constants.js';

@Module({
  imports: [PrismaModule, FacultyModule, ModuleModule],
  controllers: [TeacherController],
  providers: [
    TeacherService,
    {
      provide: TEACHER_REPOSITORY,
      useClass: TeacherRepository,
    },
  ],
  exports: [TeacherService, TEACHER_REPOSITORY],
})
export class TeacherModule {}
