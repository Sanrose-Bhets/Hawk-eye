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
    return this.prisma.orm.public.Faculty.create(data) as Promise<FacultyModel>;
  }

  async findAll(): Promise<FacultyModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Faculty.where({}) as any
    ).all();
    return results as FacultyModel[];
  }

  async findById(id: string): Promise<FacultyModel | null> {
    return this.prisma.orm.public.Faculty.where({
      id,
    }).first() as Promise<FacultyModel | null>;
  }

  async findByName(name: string): Promise<FacultyModel | null> {
    return this.prisma.orm.public.Faculty.where({
      name,
    }).first() as Promise<FacultyModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Faculty.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Faculty.where({ id }).delete();
  }
}
