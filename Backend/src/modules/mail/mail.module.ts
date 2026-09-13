import { Module, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailController } from './mail.controller.js';
import { MailService } from './mail.service.js';
import { MailConsumer } from './mail.consumer.js';
import { MailRepository } from './repositories/mail.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StudentModule } from '../student/student.module.js';
import { TeacherModule } from '../teacher/teacher.module.js';
import { MAIL_REPOSITORY, MAIL_QUEUE } from './constants/mail.constants.js';
import { EMAIL_PROVIDER } from './providers/email-provider.interface.js';
import { ResendEmailProvider } from './providers/resend-email.provider.js';
import { NodemailerEmailProvider } from './providers/nodemailer-email.provider.js';

const emailProvider: Provider = {
  provide: EMAIL_PROVIDER,
  useFactory: () => {
    const provider = process.env.MAIL_PROVIDER || 'resend';
    if (provider === 'nodemailer') {
      return new NodemailerEmailProvider();
    }
    return new ResendEmailProvider();
  },
};

@Module({
  imports: [
    PrismaModule,
    StudentModule,
    TeacherModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [MailController],
  providers: [
    MailService,
    MailConsumer,
    emailProvider,
    {
      provide: MAIL_REPOSITORY,
      useClass: MailRepository,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
