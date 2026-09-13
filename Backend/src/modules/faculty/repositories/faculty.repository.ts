import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IFacultyRepository,
  FacultyModel,
} from '../interfaces/faculty.repository.interface.js';

@Injectable()
export class FacultyRepository implements IFacultyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<FacultyModel> {
    return this.prisma.orm.public.Faculty.create(data);
  }

  async findAll(): Promise<FacultyModel[]> {
    const results = await (
      this.prisma.orm.public.Faculty.where({}) as any
    ).all();
    return results as FacultyModel[];
  }

  async findById(id: string): Promise<FacultyModel | null> {
    return this.prisma.orm.public.Faculty.where({
      id,
    }).first();
  }

  async findByName(name: string): Promise<FacultyModel | null> {
    return this.prisma.orm.public.Faculty.where({
      name,
    }).first();
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Faculty.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Faculty.where({ id }).delete();
  }
}
