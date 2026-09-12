import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_REPOSITORY, MAIL_QUEUE } from './constants/mail.constants.js';
import type { IMailRepository } from './interfaces/mail.repository.interface.js';
import type { IStudentRepository } from '../student/interfaces/student.repository.interface.js';
import { STUDENT_REPOSITORY } from '../student/constants/student.constants.js';
import type { IEmailProvider } from './providers/email-provider.interface.js';
import { EMAIL_PROVIDER } from './providers/email-provider.interface.js';
import { EmailLogEntity } from './entities/email-log.entity.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_REPOSITORY)
    private readonly mailRepo: IMailRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepo: IStudentRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  async sendToParent(
    studentId: string,
    subject: string,
    body: string,
  ): Promise<SendMailResult> {
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const ts = now();
    const log = await this.mailRepo.create({
      to: student.parentEmail,
      subject,
      body,
      studentId,
      status: 'queued',
      createdAt: ts,
    });

    await this.mailQueue.add(
      'send-email',
      {
        logId: log.id,
        to: student.parentEmail,
        subject,
        body,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.logger.log(
      `Email queued for ${student.parentEmail}, logId: ${log.id}`,
    );

    return {
      id: log.id,
      status: 'queued',
      message: 'Email queued for delivery',
    };
  }

  async sendBulk(
    studentIds: string[],
    subject: string,
    body: string,
  ): Promise<{
    queued: number;
    errors: { studentId: string; reason: string }[];
  }> {
    const errors: { studentId: string; reason: string }[] = [];
    let queued = 0;

    for (const studentId of studentIds) {
      try {
        await this.sendToParent(studentId, subject, body);
        queued++;
      } catch (err) {
        errors.push({
          studentId,
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return { queued, errors };
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    data: EmailLogEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    let all = await this.mailRepo.findAll();

    if (filters.status) {
      all = all.filter((l) => l.status === filters.status);
    }

    all.sort((a, b) => {
      const aTime =
        typeof (a.createdAt as { epochMilliseconds?: number })
          .epochMilliseconds === 'number'
          ? (a.createdAt as { epochMilliseconds: number }).epochMilliseconds
          : new Date(a.createdAt as string).getTime();
      const bTime =
        typeof (b.createdAt as { epochMilliseconds?: number })
          .epochMilliseconds === 'number'
          ? (b.createdAt as { epochMilliseconds: number }).epochMilliseconds
          : new Date(b.createdAt as string).getTime();
      return bTime - aTime;
    });

    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    return {
      data: paged.map((l) => ({
        id: l.id,
        to: l.to,
        subject: l.subject,
        body: l.body,
        studentId: l.studentId,
        status: l.status,
        error: l.error,
        createdAt: l.createdAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStats(): Promise<{
    totalSent: number;
    totalQueued: number;
    totalFailed: number;
  }> {
    const totalSent = await this.mailRepo.countByStatus('sent');
    const totalQueued = await this.mailRepo.countByStatus('queued');
    const totalFailed = await this.mailRepo.countByStatus('failed');
    return { totalSent, totalQueued, totalFailed };
  }

  async markSent(id: string): Promise<void> {
    await this.mailRepo.update(id, { status: 'sent' });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.mailRepo.update(id, { status: 'failed', error });
  }
}

interface SendMailResult {
  id: string;
  status: string;
  message: string;
}
