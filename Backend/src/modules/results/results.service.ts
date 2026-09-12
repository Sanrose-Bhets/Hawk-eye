import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { RESULT_REPOSITORY } from './constants/results.constants.js';
import type { IResultRepository } from './interfaces/result.repository.interface.js';
import type { IStudentRepository } from '../student/interfaces/student.repository.interface.js';
import type { IModuleRepository } from '../module/interfaces/module.repository.interface.js';
import { STUDENT_REPOSITORY } from '../student/constants/student.constants.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import { MailService } from '../mail/mail.service.js';
import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';
import { ImportResultItemDto } from './dto/import-results.dto.js';
import { ResultEntity, ResultItemEntity } from './entities/result.entity.js';
import { toResult, toResultItem } from './factories/result.factory.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

function calculateGrade(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  if (score >= 28) return 'D';
  return 'F';
}

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(
    @Inject(RESULT_REPOSITORY)
    private readonly resultRepo: IResultRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepo: IStudentRepository,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateResultDto): Promise<ResultEntity> {
    const student = await this.studentRepo.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    for (const item of dto.items) {
      const mod = await this.moduleRepo.findById(item.moduleId);
      if (!mod) {
        throw new NotFoundException(
          `Module with id ${item.moduleId} not found`,
        );
      }
    }

    const moduleIds = dto.items.map((i) => i.moduleId);
    const uniqueModuleIds = new Set(moduleIds);
    if (uniqueModuleIds.size !== moduleIds.length) {
      throw new BadRequestException('Duplicate modules are not allowed');
    }

    let result = await this.resultRepo.findByStudentId(dto.studentId);
    const ts = now();

    if (!result) {
      result = await this.resultRepo.create({
        studentId: dto.studentId,
        published: false,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    await this.resultRepo.deleteItemsByResultId(result.id);

    for (const item of dto.items) {
      const grade = calculateGrade(item.score);
      await this.resultRepo.createItem({
        resultId: result.id,
        moduleId: item.moduleId,
        score: item.score,
        grade,
        createdAt: ts,
      });
    }

    await this.resultRepo.update(result.id, { updatedAt: ts });

    return this.findById(result.id);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
    published?: string;
  }): Promise<{
    data: ResultEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const allResults = await this.resultRepo.findAll();
    const allStudents = await this.studentRepo.findAll();
    const allModules = await this.moduleRepo.findAll();

    const studentMap = new Map(allStudents.map((s) => [s.id, s]));
    const moduleMap = new Map(allModules.map((m) => [m.id, m]));

    let enriched: ResultEntity[] = [];

    for (const result of allResults) {
      const student = studentMap.get(result.studentId);
      if (!student) continue;

      const items = await this.resultRepo.findItemsByResultId(result.id);
      const enrichedItems = items.map((item) => {
        const mod = moduleMap.get(item.moduleId);
        return toResultItem(item, mod?.name ?? 'Unknown', mod?.code ?? null);
      });

      enriched.push(
        toResult(result, student.name, student.email, enrichedItems),
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentEmail.toLowerCase().includes(q) ||
          r.items.some(
            (i) =>
              i.moduleName.toLowerCase().includes(q) ||
              i.moduleCode?.toLowerCase().includes(q),
          ),
      );
    }

    if (filters.grade) {
      enriched = enriched.filter((r) =>
        r.items.some((i) => i.grade === filters.grade),
      );
    }

    if (filters.published !== undefined && filters.published !== '') {
      const isPublished = filters.published === 'true';
      enriched = enriched.filter((r) => r.published === isPublished);
    }

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = enriched.slice(offset, offset + limit);

    return { data: paged, total, page, limit, totalPages };
  }

  async findById(id: string): Promise<ResultEntity> {
    const result = await this.resultRepo.findById(id);
    if (!result) {
      throw new NotFoundException('Result not found');
    }

    const student = await this.studentRepo.findById(result.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const items = await this.resultRepo.findItemsByResultId(result.id);
    const allModules = await this.moduleRepo.findAll();
    const moduleMap = new Map(allModules.map((m) => [m.id, m]));

    const enrichedItems = items.map((item) => {
      const mod = moduleMap.get(item.moduleId);
      return toResultItem(item, mod?.name ?? 'Unknown', mod?.code ?? null);
    });

    return toResult(result, student.name, student.email, enrichedItems);
  }

  async update(id: string, dto: UpdateResultDto): Promise<ResultEntity> {
    const existing = await this.resultRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Result not found');
    }

    for (const item of dto.items) {
      const mod = await this.moduleRepo.findById(item.moduleId);
      if (!mod) {
        throw new NotFoundException(
          `Module with id ${item.moduleId} not found`,
        );
      }
    }

    const ts = now();
    await this.resultRepo.deleteItemsByResultId(id);

    for (const item of dto.items) {
      const grade = calculateGrade(item.score);
      await this.resultRepo.createItem({
        resultId: id,
        moduleId: item.moduleId,
        score: item.score,
        grade,
        createdAt: ts,
      });
    }

    await this.resultRepo.update(id, { updatedAt: ts });

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.resultRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Result not found');
    }
    await this.resultRepo.deleteItemsByResultId(id);
    await this.resultRepo.delete(id);
  }

  async importResults(items: ImportResultItemDto[]): Promise<{
    created: number;
    errors: { studentEmail: string; moduleCode: string; reason: string }[];
  }> {
    const errors: {
      studentEmail: string;
      moduleCode: string;
      reason: string;
    }[] = [];
    let created = 0;

    const allStudents = await this.studentRepo.findAll();
    const allModules = await this.moduleRepo.findAll();

    const studentByEmail = new Map(
      allStudents.map((s) => [s.email.toLowerCase(), s]),
    );
    const moduleByCode = new Map(
      allModules.filter((m) => m.code).map((m) => [m.code!.toLowerCase(), m]),
    );

    const grouped = new Map<string, ImportResultItemDto[]>();
    for (const item of items) {
      const key = item.studentEmail.toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }

    const ts = now();

    for (const [email, groupItems] of grouped) {
      const student = studentByEmail.get(email);
      if (!student) {
        for (const item of groupItems) {
          errors.push({
            studentEmail: item.studentEmail,
            moduleCode: item.moduleCode,
            reason: 'Student not found',
          });
        }
        continue;
      }

      let result = await this.resultRepo.findByStudentId(student.id);
      if (!result) {
        result = await this.resultRepo.create({
          studentId: student.id,
          published: false,
          createdAt: ts,
          updatedAt: ts,
        });
      }

      await this.resultRepo.deleteItemsByResultId(result.id);

      const seenModules = new Set<string>();
      for (const item of groupItems) {
        const mod = moduleByCode.get(item.moduleCode.toLowerCase());
        if (!mod) {
          errors.push({
            studentEmail: item.studentEmail,
            moduleCode: item.moduleCode,
            reason: 'Module not found',
          });
          continue;
        }

        if (seenModules.has(mod.id)) {
          errors.push({
            studentEmail: item.studentEmail,
            moduleCode: item.moduleCode,
            reason: 'Duplicate module in CSV for this student',
          });
          continue;
        }
        seenModules.add(mod.id);

        const grade = calculateGrade(item.score);
        await this.resultRepo.createItem({
          resultId: result.id,
          moduleId: mod.id,
          score: item.score,
          grade,
          createdAt: ts,
        });
        created++;
      }

      await this.resultRepo.update(result.id, { updatedAt: ts });
    }

    return { created, errors };
  }

  async publish(id: string, published: boolean): Promise<ResultEntity> {
    const existing = await this.resultRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Result not found');
    }

    await this.resultRepo.update(id, {
      published,
      updatedAt: now(),
    });

    const result = await this.findById(id);

    if (published) {
      try {
        const mailResult = await this.mailService.sendResultPublished({
          studentId: result.studentId,
          studentName: result.studentName,
          studentEmail: result.studentEmail,
          items: result.items,
        });
        this.logger.log(
          `Result published for ${result.studentName}: ${mailResult.queued} email(s) queued`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to send result emails for ${result.studentName}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }

    return result;
  }

  async publishAll(): Promise<{ published: number; emailed: number }> {
    const allResults = await this.resultRepo.findAll();
    const unpublished = allResults.filter((r) => !r.published);
    const ts = now();

    let published = 0;
    let emailed = 0;

    for (const result of unpublished) {
      await this.resultRepo.update(result.id, {
        published: true,
        updatedAt: ts,
      });
      published++;

      try {
        const enriched = await this.findById(result.id);
        const mailResult = await this.mailService.sendResultPublished({
          studentId: enriched.studentId,
          studentName: enriched.studentName,
          studentEmail: enriched.studentEmail,
          items: enriched.items,
        });
        emailed += mailResult.queued;
      } catch (err) {
        this.logger.error(
          `Failed to send result emails for result ${result.id}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }

    this.logger.log(
      `Publish all: ${published} results published, ${emailed} emails queued`,
    );
    return { published, emailed };
  }
}
