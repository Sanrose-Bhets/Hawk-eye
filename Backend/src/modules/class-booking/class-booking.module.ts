import { Module } from '@nestjs/common';
import { ClassBookingController } from './class-booking.controller.js';
import { ClassBookingService } from './class-booking.service.js';
import { ClassBookingScheduler } from './class-booking.scheduler.js';
import { ClassBookingRepository } from './repositories/class-booking.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SeatPlanModule } from '../seat-plan/seat-plan.module.js';
import { CLASS_BOOKING_REPOSITORY } from './constants/class-booking.constants.js';

@Module({
  imports: [PrismaModule, SeatPlanModule],
  controllers: [ClassBookingController],
  providers: [
    ClassBookingService,
    ClassBookingScheduler,
    {
      provide: CLASS_BOOKING_REPOSITORY,
      useClass: ClassBookingRepository,
    },
  ],
})
export class ClassBookingModule {}
