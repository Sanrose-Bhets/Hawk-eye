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

  async sendResultPublished(result: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    items: {
      moduleName: string;
      moduleCode: string | null;
      score: number;
      grade: string;
    }[];
  }): Promise<{ queued: number; errors: string[] }> {
    const errors: string[] = [];
    let queued = 0;

    const student = await this.studentRepo.findById(result.studentId);
    if (!student) {
      errors.push('Student not found');
      return { queued: 0, errors };
    }

    const subject = `Results Published - ${result.studentName}`;
    const body = this.buildResultEmailHtml(result.studentName, result.items);

    const recipients = [student.email, student.parentEmail].filter(
      (e): e is string => !!e,
    );

    for (const recipient of recipients) {
      try {
        const ts = now();
        const log = await this.mailRepo.create({
          to: recipient,
          subject,
          body,
          studentId: result.studentId,
          status: 'queued',
          createdAt: ts,
        });

        await this.mailQueue.add(
          'send-email',
          { logId: log.id, to: recipient, subject, body },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
        );

        this.logger.log(
          `Results email queued for ${recipient}, logId: ${log.id}`,
        );
        queued++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to queue results email for ${recipient}: ${msg}`,
        );
        errors.push(msg);
      }
    }

    return { queued, errors };
  }

  private buildResultEmailHtml(
    studentName: string,
    items: {
      moduleName: string;
      moduleCode: string | null;
      score: number;
      grade: string;
    }[],
  ): string {
    const rows = items
      .map(
        (i) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${i.moduleName}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${i.moduleCode ?? '-'}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;text-align:center;">${i.score}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;text-align:center;color:${i.grade === 'F' ? '#dc2626' : '#059669'};">${i.grade}</td>
        </tr>`,
      )
      .join('');

    return `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Results Published</h2>
          <p style="margin:0;font-size:14px;color:#6b7280;">Dear ${studentName},</p>
          <p style="margin:8px 0 0;font-size:14px;color:#374151;">Your academic results have been published. Please find the details below:</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px 14px;text-align:left;font-size:13px;font-weight:600;color:#475569;">Module</th>
              <th style="padding:10px 14px;text-align:left;font-size:13px;font-weight:600;color:#475569;">Code</th>
              <th style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600;color:#475569;">Score</th>
              <th style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600;color:#475569;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>`;
  }
}

interface SendMailResult {
  id: string;
  status: string;
  message: string;
}
