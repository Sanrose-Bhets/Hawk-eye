import { Module } from '@nestjs/common';
import { FacultyController } from './faculty.controller.js';
import { FacultyService } from './faculty.service.js';
import { FacultyRepository } from './repositories/faculty.repository.js';
import { ModuleRepository } from './repositories/module.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import {
  FACULTY_REPOSITORY,
  MODULE_REPOSITORY,
} from './constants/faculty.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [FacultyController],
  providers: [
    FacultyService,
    {
      provide: FACULTY_REPOSITORY,
      useClass: FacultyRepository,
    },
    {
      provide: MODULE_REPOSITORY,
      useClass: ModuleRepository,
    },
  ],
  exports: [FacultyService],
})
export class FacultyModule {}
