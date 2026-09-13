import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_REPOSITORY, MAIL_QUEUE } from './constants/mail.constants.js';
import type { IMailRepository } from './interfaces/mail.repository.interface.js';
import type { IStudentRepository } from '../student/interfaces/student.repository.interface.js';
import { STUDENT_REPOSITORY } from '../student/constants/student.constants.js';
import type { ITeacherRepository } from '../teacher/interfaces/teacher.repository.interface.js';
import { TEACHER_REPOSITORY } from '../teacher/constants/teacher.constants.js';
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
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepo: ITeacherRepository,
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

  async sendPerformanceDecreaseAlert(params: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    parentEmail: string;
    prev: {
      semester: string;
      year: string;
      gpa: number;
      averageScore: number;
      standing: string;
    };
    curr: {
      semester: string;
      year: string;
      gpa: number;
      averageScore: number;
      standing: string;
    };
    reasons: string[];
  }): Promise<{ queued: number; errors: string[] }> {
    const errors: string[] = [];
    let queued = 0;

    const subject = `Performance Alert — ${params.studentName}: Decrease Detected`;
    const body = this.buildPerformanceAlertHtml(
      params.studentName,
      params.prev,
      params.curr,
      params.reasons,
    );

    const recipients = [params.studentEmail, params.parentEmail].filter(
      (e): e is string => !!e,
    );

    // Deduplication: avoid spamming if an identical alert was sent within 7 days
    const recentLogs = await this.mailRepo.findAll();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const hasRecentAlert = recentLogs.some((log: any) => {
      if (log.studentId !== params.studentId) return false;
      if (!log.subject.includes('Performance Alert')) return false;
      const createdAtMs =
        typeof (log.createdAt as { epochMilliseconds?: number })
          .epochMilliseconds === 'number'
          ? (log.createdAt as { epochMilliseconds: number }).epochMilliseconds
          : new Date(log.createdAt as string).getTime();
      if (createdAtMs < sevenDaysAgo) return false;
      // If body contains both semester labels, it's a duplicate for same semester pair
      return (
        log.body.includes(params.prev.semester) &&
        log.body.includes(params.curr.semester)
      );
    });
    if (hasRecentAlert) {
      this.logger.log(
        `Performance alert skipped (recent duplicate) for ${params.studentName}`,
      );
      return { queued: 0, errors: [] };
    }

    for (const recipient of recipients) {
      try {
        const ts = now();
        const log = await this.mailRepo.create({
          to: recipient,
          subject,
          body,
          studentId: params.studentId,
          status: 'queued',
          createdAt: ts,
        });

        await this.mailQueue.add(
          'send-email',
          { logId: log.id, to: recipient, subject, body },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
        );

        this.logger.log(
          `Performance alert queued for ${recipient}, logId: ${log.id}`,
        );
        queued++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to queue performance alert for ${recipient}: ${msg}`,
        );
        errors.push(msg);
      }
    }

    return { queued, errors };
  }

  private buildPerformanceAlertHtml(
    studentName: string,
    prev: {
      semester: string;
      year: string;
      gpa: number;
      averageScore: number;
      standing: string;
    },
    curr: {
      semester: string;
      year: string;
      gpa: number;
      averageScore: number;
      standing: string;
    },
    reasons: string[],
  ): string {
    const scoreDrop = (prev.averageScore - curr.averageScore).toFixed(1);
    const gpaDrop = (prev.gpa - curr.gpa).toFixed(2);
    const reasonsHtml = reasons
      .map((r) => `<li style="margin:4px 0;color:#7f1d1d;">${r}</li>`)
      .join('');

    return `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:20px;">
          <h2 style="margin:0 0 6px;font-size:18px;color:#991b1b;">⚠️ Performance Decrease Detected</h2>
          <p style="margin:0;font-size:14px;color:#7f1d1d;">Dear ${studentName} (and Parent/Guardian),</p>
          <p style="margin:8px 0 0;font-size:14px;color:#374151;">Our analytics detected a decline in academic performance between <strong>${prev.semester}</strong> and <strong>${curr.semester}</strong>. Please review the details below and consider academic support.</p>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:16px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 14px;text-align:left;font-size:13px;font-weight:600;color:#475569;">Semester</th>
              <th style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600;color:#475569;">Avg Score</th>
              <th style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600;color:#475569;">GPA</th>
              <th style="padding:10px 14px;text-align:left;font-size:13px;font-weight:600;color:#475569;">Standing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px 14px;font-size:14px;color:#111827;">${prev.semester}<br/><span style="font-size:11px;color:#6b7280;">${prev.year}</span></td>
              <td style="padding:10px 14px;font-size:14px;text-align:center;">${prev.averageScore.toFixed(1)}%</td>
              <td style="padding:10px 14px;font-size:14px;text-align:center;">${prev.gpa.toFixed(2)}</td>
              <td style="padding:10px 14px;font-size:13px;color:#374151;">${prev.standing}</td>
            </tr>
            <tr style="background:#fef2f2;">
              <td style="padding:10px 14px;font-size:14px;color:#991b1b;font-weight:600;">${curr.semester}<br/><span style="font-size:11px;color:#991b1b;">${curr.year}</span></td>
              <td style="padding:10px 14px;font-size:14px;text-align:center;color:#991b1b;font-weight:600;">${curr.averageScore.toFixed(1)}%<br/><span style="font-size:11px;">(−${scoreDrop}%)</span></td>
              <td style="padding:10px 14px;font-size:14px;text-align:center;color:#991b1b;font-weight:600;">${curr.gpa.toFixed(2)}<br/><span style="font-size:11px;">(−${gpaDrop})</span></td>
              <td style="padding:10px 14px;font-size:13px;color:#991b1b;font-weight:600;">${curr.standing}</td>
            </tr>
          </tbody>
        </table>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#92400e;">Reasons flagged:</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#7f1d1d;">${reasonsHtml}</ul>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;">We recommend reaching out to your academic advisor or student support services. Early intervention can help get back on track.</p>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af;text-align:center;">This is an automated notification based on performance analytics (5% score / 0.30 GPA / standing downgrade threshold). Please do not reply directly.</p>
      </div>`;
  }

  async sendExamRoutinePublishedToTeachers(params: {
    moduleId: string;
    moduleName: string;
    facultyName?: string;
    examRoutine: {
      id: string;
      date: unknown;
      startTime: string;
      endTime: string;
      duration: string;
      facultyId: string;
    };
  }): Promise<{ queued: number; errors: string[] }> {
    const errors: string[] = [];
    let queued = 0;

    const teachers = await this.teacherRepo.findByModuleId(params.moduleId);
    if (teachers.length === 0) {
      this.logger.log(
        `No teachers found for module ${params.moduleName} (${params.moduleId}), skipping mail`,
      );
      return { queued: 0, errors: [] };
    }

    const dateStr = (() => {
      const d: any = params.examRoutine.date;
      const epochMs =
        typeof d?.epochMilliseconds === 'number'
          ? d.epochMilliseconds
          : new Date(d as string).getTime();
      return new Date(epochMs).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    })();

    const subject = `Exam Scheduled — ${params.moduleName} (${dateStr})`;
    const body = this.buildExamRoutineEmailHtml({
      moduleName: params.moduleName,
      facultyName: params.facultyName,
      dateStr,
      startTime: params.examRoutine.startTime,
      endTime: params.examRoutine.endTime,
      duration: params.examRoutine.duration,
    });

    for (const teacher of teachers) {
      try {
        const ts = now();
        const log = await this.mailRepo.create({
          to: teacher.email,
          subject,
          body,
          teacherId: teacher.id,
          status: 'queued',
          createdAt: ts,
        });

        await this.mailQueue.add(
          'send-email',
          { logId: log.id, to: teacher.email, subject, body },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
        );

        this.logger.log(
          `Exam routine mail queued for teacher ${teacher.email}, logId: ${log.id}`,
        );
        queued++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to queue exam routine mail for ${teacher.email}: ${msg}`,
        );
        errors.push(msg);
      }
    }

    return { queued, errors };
  }

  private buildExamRoutineEmailHtml(params: {
    moduleName: string;
    facultyName?: string;
    dateStr: string;
    startTime: string;
    endTime: string;
    duration: string;
  }): string {
    return `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:20px;">
          <h2 style="margin:0 0 6px;font-size:18px;color:#1e40af;">📅 Exam Routine Published</h2>
          <p style="margin:0;font-size:14px;color:#1e3a8a;">Dear Teacher,</p>
          <p style="margin:8px 0 0;font-size:14px;color:#374151;">An exam has been scheduled for <strong>${params.moduleName}</strong>${params.facultyName ? ` under <strong>${params.facultyName}</strong>` : ''}. Please find the details below and prepare accordingly.</p>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:16px;">
          <tbody>
            <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;width:140px;">Module</td><td style="padding:10px 14px;font-size:14px;color:#111827;">${params.moduleName}</td></tr>
            ${params.facultyName ? `<tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;">Faculty</td><td style="padding:10px 14px;font-size:14px;color:#111827;">${params.facultyName}</td></tr>` : ''}
            <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;">Date</td><td style="padding:10px 14px;font-size:14px;color:#111827;">${params.dateStr}</td></tr>
            <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;">Time</td><td style="padding:10px 14px;font-size:14px;color:#111827;">${params.startTime} – ${params.endTime} (${params.duration})</td></tr>
          </tbody>
        </table>

        <p style="margin:0;font-size:13px;color:#6b7280;">If you have any concerns or need to request changes, please contact the RTE office.</p>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af;text-align:center;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>`;
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
