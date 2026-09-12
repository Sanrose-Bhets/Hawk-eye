import { Module } from '@nestjs/common';
import { FacultyController } from './faculty.controller.js';
import { FacultyService } from './faculty.service.js';
import { FacultyRepository } from './repositories/faculty.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FACULTY_REPOSITORY } from './constants/faculty.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [FacultyController],
  providers: [
    FacultyService,
    {
      provide: FACULTY_REPOSITORY,
      useClass: FacultyRepository,
    },
  ],
  exports: [FacultyService, FACULTY_REPOSITORY],
})
export class FacultyModule {}
