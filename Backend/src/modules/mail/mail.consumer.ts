import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MAIL_QUEUE } from './constants/mail.constants.js';
import type {
  IEmailProvider,
  EmailAttachment,
} from './providers/email-provider.interface.js';
import { Inject } from '@nestjs/common';
import { EMAIL_PROVIDER } from './providers/email-provider.interface.js';
import type { IMailRepository } from './interfaces/mail.repository.interface.js';
import { MAIL_REPOSITORY } from './constants/mail.constants.js';

interface SendEmailJobData {
  logId?: string;
  to: string;
  subject: string;
  body: string;
  attachment?: {
    filename: string;
    content: string;
  };
}

@Processor(MAIL_QUEUE)
export class MailConsumer extends WorkerHost {
  private readonly logger = new Logger(MailConsumer.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    @Inject(MAIL_REPOSITORY)
    private readonly mailRepo: IMailRepository,
  ) {
    super();
  }

  async process(job: Job<SendEmailJobData>): Promise<void> {
    const { logId, to, subject, body, attachment } = job.data;
    this.logger.log(`Processing email job ${job.id} for ${to}`);

    const attachments: EmailAttachment[] | undefined = attachment
      ? [{ filename: attachment.filename, content: attachment.content }]
      : undefined;

    const result = await this.emailProvider.send(
      to,
      subject,
      body,
      attachments,
    );

    if (result.success) {
      if (logId) {
        await this.mailRepo.update(logId, { status: 'sent' });
      }
      this.logger.log(
        `Email sent successfully to ${to}${logId ? `, logId: ${logId}` : ''}`,
      );
    } else {
      if (logId) {
        await this.mailRepo.update(logId, {
          status: 'failed',
          error: 'Provider returned failure',
        });
      }
      this.logger.error(
        `Failed to send email to ${to}${logId ? `, logId: ${logId}` : ''}`,
      );
      throw new Error(`Failed to send email to ${to}`);
    }
  }
}
