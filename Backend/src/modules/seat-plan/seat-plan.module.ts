import { Module } from '@nestjs/common';
import { SeatPlanController } from './seat-plan.controller.js';
import { SeatPlanService } from './seat-plan.service.js';
import { FloorPlanRepository } from './repositories/floor-plan.repository.js';
import { ClassRepository } from './repositories/class.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FLOOR_PLAN_REPOSITORY, CLASS_REPOSITORY } from './constants/seat-plan.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [SeatPlanController],
  providers: [
    SeatPlanService,
    {
      provide: FLOOR_PLAN_REPOSITORY,
      useClass: FloorPlanRepository,
    },
    {
      provide: CLASS_REPOSITORY,
      useClass: ClassRepository,
    },
  ],
})
export class SeatPlanModule {}
