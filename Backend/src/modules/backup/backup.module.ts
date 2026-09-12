import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { BackupController } from './backup.controller.js';
import { BackupService } from './backup.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MAIL_QUEUE } from '../mail/constants/mail.constants.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
