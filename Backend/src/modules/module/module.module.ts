import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller.js';
import { ModuleService } from './module.service.js';
import { ModuleRepository } from './repositories/module.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FacultyModule } from '../faculty/faculty.module.js';
import { MODULE_REPOSITORY } from './constants/module.constants.js';

@Module({
  imports: [PrismaModule, FacultyModule],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    {
      provide: MODULE_REPOSITORY,
      useClass: ModuleRepository,
    },
  ],
  exports: [ModuleService],
})
export class ModuleModule {}
