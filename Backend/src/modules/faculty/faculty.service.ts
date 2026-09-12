import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import {
  FACULTY_REPOSITORY,
  MODULE_REPOSITORY,
} from './constants/faculty.constants.js';
import type { IFacultyRepository } from './interfaces/faculty.repository.interface.js';
import type { IModuleRepository } from './interfaces/module.repository.interface.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';
import { UpdateFacultyDto } from './dto/update-faculty.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { FacultyEntity } from './entities/faculty.entity.js';
import { ModuleEntity } from './entities/module.entity.js';
import { toFaculty } from './factories/faculty.factory.js';
import { toModule } from './factories/module.factory.js';

@Injectable()
export class FacultyService {
  constructor(
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
  ) {}

  async createFaculty(dto: CreateFacultyDto): Promise<FacultyEntity> {
    const existing = await this.facultyRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Faculty with this name already exists');
    }

    const now = new Date();
    const model = await this.facultyRepo.create({
      name: dto.name,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    });

    return toFaculty(model);
  }

  async findAllFaculties(): Promise<FacultyEntity[]> {
    const models = await this.facultyRepo.findAll();
    return models.map(toFaculty);
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

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

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

  async createModule(dto: CreateModuleDto): Promise<ModuleEntity> {
    const faculty = await this.facultyRepo.findById(dto.facultyId);
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const now = new Date();
    const model = await this.moduleRepo.create({
      name: dto.name,
      code: dto.code,
      moduleLeader: dto.moduleLeader,
      facultyId: dto.facultyId,
      createdAt: now,
      updatedAt: now,
    });

    return toModule(model);
  }

  async findModulesByFaculty(facultyId: string): Promise<ModuleEntity[]> {
    const faculty = await this.facultyRepo.findById(facultyId);
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const models = await this.moduleRepo.findByFacultyId(facultyId);
    return models.map(toModule);
  }

  async findModuleById(id: string): Promise<ModuleEntity> {
    const model = await this.moduleRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Module not found');
    }
    return toModule(model);
  }

  async updateModule(id: string, dto: UpdateModuleDto): Promise<ModuleEntity> {
    const existing = await this.moduleRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Module not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

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
    return this.findModuleById(id);
  }

  async deleteModule(id: string): Promise<void> {
    const existing = await this.moduleRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Module not found');
    }
    await this.moduleRepo.delete(id);
  }
}
