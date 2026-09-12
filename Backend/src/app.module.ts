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
  ],
})
export class AppModule {}
