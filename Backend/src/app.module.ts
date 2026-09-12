import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston/winston.config.js';
import { CommonModule } from './common/common.module.js';
import { RedisModule } from './common/redis/redis.module.js';
import { FileStorageModule } from './common/file-storage/file-storage.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SeatPlanModule } from './modules/seat-plan/seat-plan.module.js';
import { StudentModule } from './modules/student/student.module.js';
import { FacultyModule } from './modules/faculty/faculty.module.js';
import { ModuleModule } from './modules/module/module.module.js';
import { ResultsModule } from './modules/results/results.module.js';
import { MailModule } from './modules/mail/mail.module.js';
import { CalendarModule } from './modules/calendar/calendar.module.js';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    CommonModule,
    RedisModule,
    FileStorageModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    SeatPlanModule,
    StudentModule,
    FacultyModule,
    ModuleModule,
    ResultsModule,
    MailModule,
    CalendarModule,
  ],
})
export class AppModule {}
