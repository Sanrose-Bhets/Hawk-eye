import { Module } from '@nestjs/common';
import { StudentController } from './student.controller.js';
import { StudentService } from './student.service.js';
import { StudentRepository } from './repositories/student.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { STUDENT_REPOSITORY } from './constants/student.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [
    StudentService,
    {
      provide: STUDENT_REPOSITORY,
      useClass: StudentRepository,
    },
  ],
  exports: [StudentService],
})
export class StudentModule {}
