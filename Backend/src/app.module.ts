import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston/winston.config.js';
import { CommonModule } from './common/common.module.js';
import { RedisModule } from './common/redis/redis.module.js';
import { CacheModule } from './common/cache/cache.module.js';
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
import { ExamRoutineModule } from './modules/exam-routine/exam-routine.module.js';
import { BackupModule } from './modules/backup/backup.module.js';
import { AdmitCardModule } from './modules/admit-card/admit-card.module.js';
import { ClassBookingModule } from './modules/class-booking/class-booking.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    WinstonModule.forRoot(winstonConfig),
    CommonModule,
    RedisModule,
    CacheModule,
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
    ExamRoutineModule,
    BackupModule,
    AdmitCardModule,
    ClassBookingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
