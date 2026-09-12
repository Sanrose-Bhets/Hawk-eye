import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller.js';
import { CalendarService } from './calendar.service.js';
import { CalendarRepository } from './repositories/calendar.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CALENDAR_REPOSITORY } from './constants/calendar.constants.js';

@Module({
  imports: [PrismaModule],
  controllers: [CalendarController],
  providers: [
    CalendarService,
    {
      provide: CALENDAR_REPOSITORY,
      useClass: CalendarRepository,
    },
  ],
  exports: [CalendarService],
})
export class CalendarModule {}
