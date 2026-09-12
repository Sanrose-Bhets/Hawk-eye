import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { EXAM_ROUTINE_REPOSITORY } from './constants/exam-routine.constants.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import type { IExamRoutineRepository } from './interfaces/exam-routine.repository.interface.js';
import type { IModuleRepository } from '../module/interfaces/module.repository.interface.js';
import type { IFacultyRepository } from '../faculty/interfaces/faculty.repository.interface.js';
import { CreateExamRoutineDto } from './dto/create-exam-routine.dto.js';
import { UpdateExamRoutineDto } from './dto/update-exam-routine.dto.js';
import { ExamRoutineEntity } from './entities/exam-routine.entity.js';
import { toExamRoutine } from './factories/exam-routine.factory.js';
import { CacheService } from '../../common/cache/cache.service.js';

const CACHE_KEY = 'examroutines:all';
const CACHE_TTL = 300;

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

function calculateDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const diff = endMinutes - startMinutes;
  if (diff < 0) {
    throw new BadRequestException('End time must be after start time');
  }
  if (diff === 0) return '0m';
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

@Injectable()
export class ExamRoutineService {
  constructor(
    @Inject(EXAM_ROUTINE_REPOSITORY)
    private readonly examRoutineRepo: IExamRoutineRepository,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
    private readonly cache: CacheService,
  ) {}

  private async resolveNames(
    moduleId: string,
    facultyId: string,
  ): Promise<{ moduleName?: string; facultyName?: string }> {
    let modules = await this.cache.get<any[]>('modules:all');
    if (!modules) {
      modules = await this.moduleRepo.findAll();
      await this.cache.set('modules:all', modules, 3600);
    }
    const mod = modules.find((m) => m.id === moduleId);

    let faculties = await this.cache.get<any[]>('faculties:all');
    if (!faculties) {
      faculties = await this.facultyRepo.findAll();
      await this.cache.set('faculties:all', faculties, 3600);
    }
    const fac = faculties.find((f) => f.id === facultyId);

    return { moduleName: mod?.name, facultyName: fac?.name };
  }

  private async enrich(routine: any): Promise<ExamRoutineEntity> {
    const names = await this.resolveNames(routine.moduleId, routine.facultyId);
    return toExamRoutine(routine, names.moduleName, names.facultyName);
  }

  async create(
    rteId: string,
    dto: CreateExamRoutineDto,
  ): Promise<ExamRoutineEntity> {
    const ts = now();
    const duration = calculateDuration(dto.startTime, dto.endTime);
    const model = await this.examRoutineRepo.create({
      rteId,
      date: Temporal.Instant.fromEpochMilliseconds(
        new Date(dto.date).getTime(),
      ),
      startTime: dto.startTime,
      endTime: dto.endTime,
      duration,
      facultyId: dto.facultyId,
      moduleId: dto.moduleId,
      createdAt: ts,
      updatedAt: ts,
    });

    await this.cache.invalidatePattern('examroutines:*');
    return this.enrich(model);
  }

  async findAll(
    rteId: string,
    filters?: { month?: number; year?: number },
  ): Promise<ExamRoutineEntity[]> {
    let all = await this.cache.get<any[]>(CACHE_KEY);
    if (!all) {
      all = await this.examRoutineRepo.findAll();
      await this.cache.set(CACHE_KEY, all, CACHE_TTL);
    }

    all = all.filter((r) => r.rteId === rteId);

    if (filters?.month !== undefined && filters?.year !== undefined) {
      all = all.filter((r) => {
        const epochMs =
          typeof (r.date as { epochMilliseconds?: number })
            .epochMilliseconds === 'number'
            ? (r.date as { epochMilliseconds: number }).epochMilliseconds
            : new Date(r.date as string).getTime();
        const d = new Date(epochMs);
        return (
          d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year
        );
      });
    }

    all.sort((a, b) => {
      const aTime =
        typeof (a.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (a.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(a.date as string).getTime();
      const bTime =
        typeof (b.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (b.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(b.date as string).getTime();
      return aTime - bTime;
    });

    const modules = await this.cache.get<any[]>('modules:all');
    const faculties = await this.cache.get<any[]>('faculties:all');
    const moduleMap = new Map((modules || []).map((m) => [m.id, m]));
    const facultyMap = new Map((faculties || []).map((f) => [f.id, f]));

    return all.map((r) =>
      toExamRoutine(
        r,
        moduleMap.get(r.moduleId)?.name,
        facultyMap.get(r.facultyId)?.name,
      ),
    );
  }

  async findAllByFaculty(
    facultyId: string,
    filters?: { month?: number; year?: number },
  ): Promise<ExamRoutineEntity[]> {
    let all = await this.cache.get<any[]>(CACHE_KEY);
    if (!all) {
      all = await this.examRoutineRepo.findAll();
      await this.cache.set(CACHE_KEY, all, CACHE_TTL);
    }

    all = all.filter((r) => r.facultyId === facultyId);

    if (filters?.month !== undefined && filters?.year !== undefined) {
      all = all.filter((r) => {
        const epochMs =
          typeof (r.date as { epochMilliseconds?: number })
            .epochMilliseconds === 'number'
            ? (r.date as { epochMilliseconds: number }).epochMilliseconds
            : new Date(r.date as string).getTime();
        const d = new Date(epochMs);
        return (
          d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year
        );
      });
    }

    all.sort((a, b) => {
      const aTime =
        typeof (a.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (a.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(a.date as string).getTime();
      const bTime =
        typeof (b.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (b.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(b.date as string).getTime();
      return aTime - bTime;
    });

    const modules = await this.cache.get<any[]>('modules:all');
    const faculties = await this.cache.get<any[]>('faculties:all');
    const moduleMap = new Map((modules || []).map((m) => [m.id, m]));
    const facultyMap = new Map((faculties || []).map((f) => [f.id, f]));

    return all.map((r) =>
      toExamRoutine(
        r,
        moduleMap.get(r.moduleId)?.name,
        facultyMap.get(r.facultyId)?.name,
      ),
    );
  }

  async findById(id: string, rteId: string): Promise<ExamRoutineEntity> {
    const model = await this.examRoutineRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Exam routine not found');
    }
    if (model.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }
    return this.enrich(model);
  }

  async update(
    id: string,
    rteId: string,
    dto: UpdateExamRoutineDto,
  ): Promise<ExamRoutineEntity> {
    const existing = await this.examRoutineRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam routine not found');
    }
    if (existing.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Record<string, unknown> = { updatedAt: now() };
    if (dto.date !== undefined) {
      updateData.date = Temporal.Instant.fromEpochMilliseconds(
        new Date(dto.date).getTime(),
      );
    }
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;

    const newStart = dto.startTime ?? (existing.startTime as string);
    const newEnd = dto.endTime ?? (existing.endTime as string);
    updateData.duration = calculateDuration(newStart, newEnd);

    if (dto.facultyId !== undefined) updateData.facultyId = dto.facultyId;
    if (dto.moduleId !== undefined) updateData.moduleId = dto.moduleId;

    await this.examRoutineRepo.update(id, updateData);
    await this.cache.invalidatePattern('examroutines:*');
    return this.findById(id, rteId);
  }

  async delete(id: string, rteId: string): Promise<void> {
    const existing = await this.examRoutineRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Exam routine not found');
    }
    if (existing.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }
    await this.examRoutineRepo.delete(id);
    await this.cache.invalidatePattern('examroutines:*');
  }
}
