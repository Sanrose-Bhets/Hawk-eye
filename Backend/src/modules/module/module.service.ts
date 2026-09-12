import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { MODULE_REPOSITORY } from './constants/module.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import type { IModuleRepository } from './interfaces/module.repository.interface.js';
import type { IFacultyRepository } from '../faculty/interfaces/faculty.repository.interface.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { ModuleEntity } from './entities/module.entity.js';
import { toModule } from './factories/module.factory.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class ModuleService {
  constructor(
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
  ) {}

  async create(dto: CreateModuleDto): Promise<ModuleEntity> {
    const faculty = await this.facultyRepo.findById(dto.facultyId);
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const ts = now();
    const model = await this.moduleRepo.create({
      name: dto.name,
      code: dto.code,
      moduleLeader: dto.moduleLeader,
      facultyId: dto.facultyId,
      createdAt: ts,
      updatedAt: ts,
    });

    return toModule(model);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    faculty?: string;
  }): Promise<{
    data: ModuleEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    let all = await this.moduleRepo.findAll();

    if (filters.faculty) {
      const faculty = await this.facultyRepo.findByName(filters.faculty);
      if (faculty) {
        all = all.filter((m) => m.facultyId === faculty.id);
      } else {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code?.toLowerCase().includes(q) ||
          m.moduleLeader.toLowerCase().includes(q),
      );
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    return {
      data: paged.map(toModule),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<ModuleEntity> {
    const model = await this.moduleRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Module not found');
    }
    return toModule(model);
  }

  async update(id: string, dto: UpdateModuleDto): Promise<ModuleEntity> {
    const existing = await this.moduleRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Module not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: now() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.moduleLeader !== undefined)
      updateData.moduleLeader = dto.moduleLeader;
    if (dto.facultyId !== undefined) {
      const faculty = await this.facultyRepo.findById(dto.facultyId);
      if (!faculty) {
        throw new NotFoundException('Faculty not found');
      }
      updateData.facultyId = dto.facultyId;
    }

    await this.moduleRepo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.moduleRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Module not found');
    }
    await this.moduleRepo.delete(id);
  }
}
