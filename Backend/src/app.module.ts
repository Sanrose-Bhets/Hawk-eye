import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston/winston.config.js';
import { CommonModule } from './common/common.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    CommonModule,
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
