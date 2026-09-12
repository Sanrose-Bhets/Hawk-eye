import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { MAIL_QUEUE } from '../mail/constants/mail.constants.js';
import { FILE_STORAGE } from '../../common/file-storage/file-storage.constants.js';
import type { IFileStorage } from '../../common/file-storage/file-storage.interface.js';

const STUDENT_SERVICE_TABLES = [
  'students',
  'faculties',
  'modules',
  'moduleSemesters',
  'results',
  'resultItems',
] as const;

const RTE_TABLES = [
  'floorPlans',
  'classes',
  'examRoutines',
  'calendarNotes',
] as const;

const ALL_TABLES = [...STUDENT_SERVICE_TABLES, ...RTE_TABLES] as const;

const TABLE_TO_MODEL: Record<string, string> = {
  students: 'Student',
  faculties: 'Faculty',
  modules: 'Module',
  moduleSemesters: 'ModuleSemester',
  results: 'Result',
  resultItems: 'ResultItem',
  floorPlans: 'FloorPlan',
  classes: 'Class',
  examRoutines: 'ExamRoutine',
  calendarNotes: 'CalendarNote',
  emailLogs: 'EmailLog',
};

const DEPENDENCY_ORDER = [
  'emailLogs',
  'calendarNotes',
  'examRoutines',
  'resultItems',
  'results',
  'classes',
  'floorPlans',
  'moduleSemesters',
  'modules',
  'students',
  'faculties',
] as const;

const IMPORT_ORDER = [
  'faculties',
  'students',
  'modules',
  'moduleSemesters',
  'results',
  'resultItems',
  'floorPlans',
  'classes',
  'examRoutines',
  'calendarNotes',
  'emailLogs',
] as const;

interface BackupData {
  students: unknown[];
  faculties: unknown[];
  modules: unknown[];
  moduleSemesters: unknown[];
  results: unknown[];
  resultItems: unknown[];
  floorPlans: unknown[];
  classes: unknown[];
  examRoutines: unknown[];
  calendarNotes: unknown[];
  emailLogs: unknown[];
}

interface BackupPayload {
  version: string;
  exportedAt: string;
  data: BackupData;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE) private readonly fileStorage: IFileStorage,
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  private getTablesForRole(role: string): readonly string[] {
    if (role === 'STUDENT_SERVICE') return STUDENT_SERVICE_TABLES;
    if (role === 'RTE') return RTE_TABLES;
    throw new ForbiddenException(`Role ${role} is not authorized for backup`);
  }

  async exportBackup(role?: string): Promise<BackupPayload> {
    const tables = role ? this.getTablesForRole(role) : ALL_TABLES;
    this.logger.log(`Starting backup export for role: ${role ?? 'ALL'}`);

    const fetches = tables.map((table) => this.getAll(TABLE_TO_MODEL[table]));
    const results = await Promise.all(fetches);

    const data: Record<string, unknown[]> = {};
    tables.forEach((table, i) => {
      data[table] = results[i];
    });

    // Fetch student images as base64
    if (data.students) {
      data.students = await Promise.all(
        data.students.map(async (student: Record<string, unknown>) => {
          if (student.image) {
            try {
              const url = await this.fileStorage.getUrl(
                student.image as string,
              );
              const response = await fetch(url);
              if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType =
                  response.headers.get('content-type') || 'image/jpeg';
                return {
                  ...student,
                  imageBase64: `data:${contentType};base64,${base64}`,
                };
              }
            } catch (err) {
              this.logger.warn(
                `Failed to fetch image for student ${student.id}: ${err}`,
              );
            }
          }
          return student;
        }),
      );
    }

    // Build full BackupData with empty arrays for tables not in scope
    const fullData: BackupData = {
      students: [],
      faculties: [],
      modules: [],
      moduleSemesters: [],
      results: [],
      resultItems: [],
      floorPlans: [],
      classes: [],
      examRoutines: [],
      calendarNotes: [],
      emailLogs: [],
    };

    for (const table of tables) {
      if (table in fullData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fullData as any)[table] = data[table] || [];
      }
    }

    const payload: BackupPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: fullData,
    };

    const counts = tables
      .map((t) => `${t}: ${(data[t] || []).length}`)
      .join(', ');
    this.logger.log(`Backup export complete: ${counts}`);

    return payload;
  }

  async importBackup(
    payload: BackupPayload,
    role: string,
  ): Promise<{ imported: Record<string, number> }> {
    const allowedTables = this.getTablesForRole(role);
    this.logger.log(`Starting backup import for role: ${role}`);

    if (!payload.data) {
      throw new BadRequestException('Invalid backup format: missing data');
    }

    // Check that payload doesn't contain tables outside role scope
    const payloadTables = Object.keys(payload.data).filter(
      (key) =>
        Array.isArray(payload.data[key as keyof BackupData]) &&
        (payload.data[key as keyof BackupData] as unknown[]).length > 0,
    );
    const forbidden = payloadTables.filter(
      (t) => !allowedTables.includes(t) && t !== 'emailLogs',
    );
    if (forbidden.length > 0) {
      throw new ForbiddenException(
        `Your role (${role}) is not authorized to import: ${forbidden.join(', ')}`,
      );
    }

    // Only delete tables this role owns
    const tablesToDelete = DEPENDENCY_ORDER.filter((t) =>
      allowedTables.includes(t),
    );
    for (const table of tablesToDelete) {
      await this.deleteAll(TABLE_TO_MODEL[table]);
    }

    // Import only tables this role owns
    const imported: Record<string, number> = {};
    const tablesToImport = IMPORT_ORDER.filter((t) =>
      allowedTables.includes(t),
    );

    for (const table of tablesToImport) {
      const items = payload.data[table as keyof BackupData] || [];
      if (table === 'students') {
        imported.students = await this.importStudentsWithImages(items);
      } else {
        imported[table] = await this.importEntities(
          TABLE_TO_MODEL[table],
          items,
        );
      }
    }

    this.logger.log('Backup import complete');
    return { imported };
  }

  async getPreview(role: string): Promise<Record<string, number>> {
    const allowedTables = this.getTablesForRole(role);

    const counts = await Promise.all(
      allowedTables.map((table) => this.count(TABLE_TO_MODEL[table])),
    );

    const result: Record<string, number> = {};
    allowedTables.forEach((table, i) => {
      result[table] = counts[i];
    });
    return result;
  }

  @Cron('0 0 * * 0') // Sunday midnight
  async sendWeeklyBackup(): Promise<void> {
    const backupEmail = process.env.BACKUP_EMAIL;
    if (!backupEmail) {
      this.logger.warn('BACKUP_EMAIL not configured, skipping weekly backup');
      return;
    }

    this.logger.log('Starting weekly backup...');

    try {
      // No role = exports ALL tables including emailLogs
      const backup = await this.exportBackup();
      const jsonContent = JSON.stringify(backup, null, 2);
      const base64Content = Buffer.from(jsonContent).toString('base64');
      const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Weekly System Backup</h2>
          <p>Your weekly backup has been generated successfully.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Exported At:</strong> ${backup.exportedAt}</p>
            <p style="margin: 4px 0;"><strong>Students:</strong> ${backup.data.students.length}</p>
            <p style="margin: 4px 0;"><strong>Modules:</strong> ${backup.data.modules.length}</p>
            <p style="margin: 4px 0;"><strong>Results:</strong> ${backup.data.results.length}</p>
            <p style="margin: 4px 0;"><strong>Floor Plans:</strong> ${backup.data.floorPlans.length}</p>
            <p style="margin: 4px 0;"><strong>Classes:</strong> ${backup.data.classes.length}</p>
            <p style="margin: 4px 0;"><strong>Exam Routines:</strong> ${backup.data.examRoutines.length}</p>
            <p style="margin: 4px 0;"><strong>Calendar Notes:</strong> ${backup.data.calendarNotes.length}</p>
            <p style="margin: 4px 0;"><strong>Email Logs:</strong> ${backup.data.emailLogs.length}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px;">The backup file is attached to this email.</p>
        </div>
      `;

      await this.mailQueue.add(
        'send-email',
        {
          to: backupEmail,
          subject: `Weekly System Backup - ${new Date().toISOString().split('T')[0]}`,
          html,
          attachment: {
            filename,
            content: base64Content,
          },
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );

      this.logger.log(`Weekly backup email queued for ${backupEmail}`);
    } catch (err) {
      this.logger.error(
        `Failed to send weekly backup: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }

  private async getAll(model: string): Promise<unknown[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (this.prisma.orm.public as any)[model].where({}).all();
  }

  private async deleteAll(model: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma.orm.public as any)[model].where({}).delete();
  }

  private async count(model: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (this.prisma.orm.public as any)[model]
      .where({})
      .all();
    return results.length;
  }

  private async importEntities(
    model: string,
    entities: unknown[],
  ): Promise<number> {
    let count = 0;
    for (const entity of entities) {
      try {
        // Strip imageBase64 if present (handled separately for students)
        const { imageBase64: _, ...data } = entity as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.prisma.orm.public as any)[model].create(data);
        count++;
      } catch (err) {
        this.logger.warn(
          `Failed to import ${model} entity: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }
    return count;
  }

  private async importStudentsWithImages(students: unknown[]): Promise<number> {
    let count = 0;
    for (const student of students) {
      try {
        const s = student as Record<string, unknown>;
        const imageBase64 = s.imageBase64 as string | undefined;
        const { imageBase64: _, ...data } = s;

        // Upload image to S3 if present
        if (imageBase64) {
          const matches = imageBase64.match(
            /^data:([a-zA-Z]+\/[a-zA-Z0-9-.]+);base64,(.+)$/,
          );
          if (matches) {
            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const ext = contentType.includes('png') ? 'png' : 'jpeg';
            const key = `students/${data.id}.${ext}`;
            await this.fileStorage.upload(buffer, key, contentType);
            data.image = key;
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.prisma.orm.public as any).Student.create(data);
        count++;
      } catch (err) {
        this.logger.warn(
          `Failed to import student: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }
    return count;
  }
}
