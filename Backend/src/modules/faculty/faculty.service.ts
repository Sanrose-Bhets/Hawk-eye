import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { FACULTY_REPOSITORY } from './constants/faculty.constants.js';
import type { IFacultyRepository } from './interfaces/faculty.repository.interface.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';
import { UpdateFacultyDto } from './dto/update-faculty.dto.js';
import { FacultyEntity } from './entities/faculty.entity.js';
import { toFaculty } from './factories/faculty.factory.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class FacultyService {
  constructor(
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
  ) {}

  async createFaculty(dto: CreateFacultyDto): Promise<FacultyEntity> {
    const existing = await this.facultyRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Faculty with this name already exists');
    }

    const ts = now();
    const model = await this.facultyRepo.create({
      name: dto.name,
      description: dto.description,
      createdAt: ts,
      updatedAt: ts,
    });

    return toFaculty(model);
  }

  async findAllFaculties(filters: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: FacultyEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    let all = await this.facultyRepo.findAll();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q),
      );
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    return {
      data: paged.map(toFaculty),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findFacultyById(id: string): Promise<FacultyEntity> {
    const model = await this.facultyRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Faculty not found');
    }
    return toFaculty(model);
  }

  async updateFaculty(
    id: string,
    dto: UpdateFacultyDto,
  ): Promise<FacultyEntity> {
    const existing = await this.facultyRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Faculty not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: now() };

    if (dto.name !== undefined) {
      const nameTaken = await this.facultyRepo.findByName(dto.name);
      if (nameTaken && nameTaken.id !== id) {
        throw new ConflictException('Faculty with this name already exists');
      }
      updateData.name = dto.name;
    }
    if (dto.description !== undefined) updateData.description = dto.description;

    await this.facultyRepo.update(id, updateData);
    return this.findFacultyById(id);
  }

  async deleteFaculty(id: string): Promise<void> {
    const existing = await this.facultyRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Faculty not found');
    }
    await this.facultyRepo.delete(id);
  }
}
