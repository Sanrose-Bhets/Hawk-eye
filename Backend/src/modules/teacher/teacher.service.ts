import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { TEACHER_REPOSITORY } from './constants/teacher.constants.js';
import type { ITeacherRepository } from './interfaces/teacher.repository.interface.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import type { IFacultyRepository } from '../faculty/interfaces/faculty.repository.interface.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import type { IModuleRepository } from '../module/interfaces/module.repository.interface.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { TeacherEntity } from './entities/teacher.entity.js';
import { toTeacher } from './factories/teacher.factory.js';
import { CacheService } from '../../common/cache/cache.service.js';

const CACHE_KEY = 'teachers:all';
const CACHE_TTL = 3600;

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class TeacherService {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepo: ITeacherRepository,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateTeacherDto): Promise<TeacherEntity> {
    const existing = await this.teacherRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Teacher with this email already exists');
    }

    if (dto.facultyIds) {
      for (const fid of dto.facultyIds) {
        const f = await this.facultyRepo.findById(fid);
        if (!f) throw new NotFoundException(`Faculty with id ${fid} not found`);
      }
    }

    if (dto.moduleIds) {
      for (const mid of dto.moduleIds) {
        const m = await this.moduleRepo.findById(mid);
        if (!m) throw new NotFoundException(`Module with id ${mid} not found`);
      }
    }

    const ts = now();
    const model = await this.teacherRepo.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      createdAt: ts,
      updatedAt: ts,
    });

    if (dto.facultyIds?.length) {
      await this.teacherRepo.setFaculties(model.id, dto.facultyIds);
    }
    if (dto.moduleIds?.length) {
      await this.teacherRepo.setModules(model.id, dto.moduleIds);
    }

    await this.cache.invalidatePattern('teachers:*');
    const created = await this.teacherRepo.findById(model.id);
    return toTeacher(created!);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: TeacherEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    let all = await this.cache.get<any[]>(CACHE_KEY);
    if (!all) {
      all = await this.teacherRepo.findAll();
      await this.cache.set(CACHE_KEY, all, CACHE_TTL);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (t: any) =>
          t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
      );
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    return {
      data: paged.map(toTeacher),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<TeacherEntity> {
    const model = await this.teacherRepo.findById(id);
    if (!model) throw new NotFoundException('Teacher not found');
    return toTeacher(model);
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherEntity> {
    const existing = await this.teacherRepo.findById(id);
    if (!existing) throw new NotFoundException('Teacher not found');

    if (dto.email && dto.email.toLowerCase() !== existing.email.toLowerCase()) {
      const byEmail = await this.teacherRepo.findByEmail(dto.email);
      if (byEmail && byEmail.id !== id) {
        throw new ConflictException('Teacher with this email already exists');
      }
    }

    if (dto.facultyIds) {
      for (const fid of dto.facultyIds) {
        const f = await this.facultyRepo.findById(fid);
        if (!f) throw new NotFoundException(`Faculty with id ${fid} not found`);
      }
    }
    if (dto.moduleIds) {
      for (const mid of dto.moduleIds) {
        const m = await this.moduleRepo.findById(mid);
        if (!m) throw new NotFoundException(`Module with id ${mid} not found`);
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: now() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();

    if (Object.keys(updateData).length > 1) {
      await this.teacherRepo.update(id, updateData);
    }

    if (dto.facultyIds !== undefined) {
      await this.teacherRepo.setFaculties(id, dto.facultyIds);
    }
    if (dto.moduleIds !== undefined) {
      await this.teacherRepo.setModules(id, dto.moduleIds);
    }

    await this.cache.invalidatePattern('teachers:*');
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.teacherRepo.findById(id);
    if (!existing) throw new NotFoundException('Teacher not found');
    await this.teacherRepo.delete(id);
    await this.cache.invalidatePattern('teachers:*');
  }
}
